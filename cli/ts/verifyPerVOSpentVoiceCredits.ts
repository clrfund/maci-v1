import * as fs from 'fs'

import { hash2, hash3, genTreeCommitment } from '@clrfund/maci-crypto'

import {
    parseArtifact,
    getDefaultSigner,
} from '@clrfund/maci-contracts'

import {
    validateEthAddress,
    contractExists,
    generateProof,
} from './utils'
import {readJSONFile} from 'maci-common'
import {contractFilepath} from './config'

import * as ethers from 'ethers'

const configureSubparser = (subparsers: any) => {
    const parser = subparsers.addParser(
        'verifyPerVOSpentVoiceCredits',
        { addHelp: true },
    )
    parser.addArgument(
        ['-t', '--tally-file'],
        {
            required: true,
            type: 'string',
            help: 'A filepath in which to save the final vote tally and salt.',
        }
    )

    parser.addArgument(
        ['-x', '--contract'],
        {
            type: 'string',
            help: 'The MACI contract address',
        }
    )

    parser.addArgument(
        ['-o', '--poll-id'],
        {
            action: 'store',
            required: true,
            type: 'string',
            help: 'The Poll ID',
        }
    )

    parser.addArgument(
        ['-tc', '--tally-contract'],
        {
            type: 'string',
            help: 'The Tally contract address',
        }
    )

    parser.addArgument(
        ['-v', '--vote-option-index'],
        {
            required: true,
            action: 'store',
            type: 'int',
            help: 'The vote option index',
        }
    )
}


const verifyPerVOSpentVoiceCredits = async (args: any) => {
    const signer = await getDefaultSigner()

    const pollId = Number(args.poll_id)

    // check existence of MACI, Tally and Subsidy contract addresses
    let contractAddrs = readJSONFile(contractFilepath)
    if ((!contractAddrs||!contractAddrs["MACI"]) && !args.contract) {
        console.error('Error: MACI contract address is empty') 
        return 
    }
    if ((!contractAddrs||!contractAddrs["Tally-"+pollId]) && !args.tally_contract) {
        console.error('Error: Tally contract address is empty') 
        return 
    }

    const maciAddress = args.contract ? args.contract: contractAddrs["MACI"]
    const tallyAddress = args.tally_contract? args.tally_contract: contractAddrs["Tally-"+pollId]

    // MACI contract
    if (!validateEthAddress(maciAddress)) {
        console.error('Error: invalid MACI contract address')
        return 
    }

    // Tally contract
    if (!validateEthAddress(tallyAddress)) {
        console.error('Error: invalid Tally contract address')
        return 
    }

    const [ maciContractAbi ] = parseArtifact('MACI')
    const [ pollContractAbi ] = parseArtifact('Poll')
    const [ tallyContractAbi ] = parseArtifact('Tally')

    if (! (await contractExists(signer.provider, tallyAddress))) {
        console.error(`Error: there is no contract deployed at ${tallyAddress}.`)
        return 
    }

    const maciContract = new ethers.Contract(
        maciAddress,
        maciContractAbi,
        signer,
    )

    const pollAddr = await maciContract.polls(pollId)
    if (!(await contractExists(signer.provider, pollAddr))) {
        console.error('Error: there is no Poll contract with this poll ID linked to the specified MACI contract.')
        return 
    }

    // Vote option index
    const voteOptionIndex = Number(args.vote_option_index)
    if (voteOptionIndex < 0) {
        console.error('Error: the vote option index should be 0 or greater')
        return
    }


    const pollContract = new ethers.Contract(
        pollAddr,
        pollContractAbi,
        signer,
    )

    const tallyContract = new ethers.Contract(
        tallyAddress,
        tallyContractAbi,
        signer,
    )

    // ----------------------------------------------
    // verify tally result

    // Read the tally file
    let contents
    try {
        contents = fs.readFileSync(args.tally_file, { encoding: 'utf8' })
    } catch {
        console.error('Error: unable to open ', args.tally_file)
        return 
    }

    // Parse the tally file
    let data
    try {
        data = JSON.parse(contents)
    } catch {
        console.error('Error: unable to parse ', args.tally_file)
        return 
    }

    const treeDepths = await pollContract.treeDepths()
    const voteOptionTreeDepth = Number(treeDepths.voteOptionTreeDepth)

    // Verify the results
    // Compute newSpentVoiceCreditsCommitment
    const newSpentVoiceCreditsCommitment = hash2([
        BigInt(data.totalSpentVoiceCredits.spent),
        BigInt(data.totalSpentVoiceCredits.salt),
    ])

    const newResultsCommitment = genTreeCommitment(
        data.results.tally.map((x) => BigInt(x)),
        data.results.salt,
        voteOptionTreeDepth
    )

    const proof = generateProof(
        voteOptionIndex,
        data.perVOSpentVoiceCredits.tally.map(x => BigInt(x)),
        BigInt(data.perVOSpentVoiceCredits.salt),
        voteOptionTreeDepth,
    )

    // verify total spent voice credits on chain
    const isValid = await tallyContract.verifyPerVOSpentVoiceCredits(
        voteOptionIndex,
        data.perVOSpentVoiceCredits.tally[voteOptionIndex],
        proof,
        data.perVOSpentVoiceCredits.salt,
        voteOptionTreeDepth,
        newSpentVoiceCreditsCommitment,
        newResultsCommitment
    )

    if (!isValid) {
        console.error('Failed to verify per vote option spent voice credits on chain')
        return
    }

    console.log('OK. finish verifyPerVOSpentVoiceCredits')

    return 
}

export {
    verifyPerVOSpentVoiceCredits,
    configureSubparser,
}
