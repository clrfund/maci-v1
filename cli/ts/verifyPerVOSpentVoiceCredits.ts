import * as fs from 'fs'

import { hash2, hash3, genTreeCommitment } from 'maci-crypto'

import {
    parseArtifact,
    getDefaultSigner,
} from 'maci-contracts'

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

    // Vote option index
    const voteOptionIndex = Number(args.vote_option_index)
    if (voteOptionIndex < 0) {
        throw new Error('Error: the vote option index should be 0 or greater')
    }

    // Read the tally file
    let contents
    try {
        contents = fs.readFileSync(args.tally_file, { encoding: 'utf8' })
    } catch {
        throw new Error(`Error: unable to open ${args.tally_file}`)
    }

    // Parse the tally file
    let data
    try {
        data = JSON.parse(contents)
    } catch {
        throw new Error(`Error: unable to parse ${args.tally_file}`)
    }

    const maciAddress = data.maci
    const pollId = Number(data.pollId)

    // check existence of MACI, Tally and Subsidy contract addresses
    if (!maciAddress) {
        throw new Error('Error: MACI contract address is empty')
    }
    let contractAddrs = readJSONFile(contractFilepath)
    if ((!contractAddrs||!contractAddrs["Tally-"+pollId]) && !args.tally_contract) {
        throw new Error('Error: Tally contract address is empty')
    }

    const tallyAddress = args.tally_contract? args.tally_contract: contractAddrs["Tally-"+pollId]

    // MACI contract
    if (!validateEthAddress(maciAddress)) {
        throw new Error('Error: invalid MACI contract address')
    }

    // Tally contract
    if (!validateEthAddress(tallyAddress)) {
        throw new Error('Error: invalid Tally contract address')
    }

    const [ maciContractAbi ] = parseArtifact('MACI')
    const [ pollContractAbi ] = parseArtifact('Poll')
    const [ tallyContractAbi ] = parseArtifact('Tally')

    if (! (await contractExists(signer.provider, tallyAddress))) {
        throw new Error(`Error: there is no contract deployed at ${tallyAddress}.`)
    }

    const maciContract = new ethers.Contract(
        maciAddress,
        maciContractAbi,
        signer,
    )

    const pollAddr = await maciContract.polls(pollId)
    if (!(await contractExists(signer.provider, pollAddr))) {
        throw new Error('Error: there is no Poll contract with this poll ID linked to the specified MACI contract.')
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
        throw new Error('Failed to verify per vote option spent voice credits on chain')
    }

    console.log('OK. finish verifyPerVOSpentVoiceCredits')
}

export {
    verifyPerVOSpentVoiceCredits,
    configureSubparser,
}
