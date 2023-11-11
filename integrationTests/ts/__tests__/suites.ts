import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

import { PubKey, PrivKey, Keypair, PCommand } from 'maci-domainobjs'

import { MaciState, TreeDepths, MaxValues } from 'maci-core'

import { genRandomSalt } from 'maci-crypto'

import { genPubKey } from 'maci-crypto'

import {
    exec,
    loadYaml,
    genTestUserCommands,
    expectTally,
    expectSubsidy,
} from './utils'
import { Wallet, utils } from 'ethers'

const execute = (command: any) => {
    console.log(command)

    const childProcess = exec(command)
    console.log(`stdout: ${childProcess.stdout}`)
    if (childProcess.stderr) {
        throw new Error(`exec failed: ${childProcess.stderr}`)
    }
    return childProcess
}

const loadData = (name: string) => {
    return require('@maci-integrationTests/ts/__tests__/' + name)
}

const deployPollByRandomUser = async (
    maciAddress: string,
    config: any,
): Promise<number> => {
    // initialize the pollId to be an invalid pollId
    let pollId = -1
    const coordinatorKeypair = new Keypair()

    // create a new user to deploy the poll
    const wallet = Wallet.createRandom()

    // fund the wallet with 1 ETH
    const totalAmount = utils.parseEther('1')
    const fundWalletCommand =
        `node build/index.js fundWallet` +
        ` -w ${wallet.address}` +
        ` -a ${totalAmount.toString()}`
    execute(fundWalletCommand)

    // sleep for 5 seconds for the funding transaction to be mined
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // new poll duration
    const duration = 999999

    const deployPollCommand =
        `node build/index.js deployPollWithSigner` +
        ` -x ${maciAddress}` +
        ` -s ${wallet.privateKey}` +
        ` -pk ${coordinatorKeypair.pubKey.serialize()}` +
        ` -t ${duration}` +
        ` -g ${config.constants.maci.maxMessages}` +
        ` -mv ${config.constants.maci.maxVoteOptions}` +
        ` -i ${config.constants.poll.intStateTreeDepth}` +
        ` -m ${config.constants.poll.messageTreeDepth}` +
        ` -b ${config.constants.poll.messageBatchDepth}` +
        ` -v ${config.constants.maci.voteOptionTreeDepth}`
    try {
        const deployPollOutput = execute(deployPollCommand).stdout.trim()
        const deployPollIdRegMatch = deployPollOutput.match(/Poll ID: ([0-9])/)
        pollId = deployPollIdRegMatch[1]
    } catch (e) {
        console.log('deployPoll error', e.message)
    }

    return pollId
}

const executeSuite = async (data: any, expect: any) => {
    try {
        const config = loadYaml()
        const coordinatorKeypair = new Keypair()

        const maciState = new MaciState()

        const deployVkRegistryCommand = `node build/index.js deployVkRegistry`
        const vkDeployOutput = exec(deployVkRegistryCommand)
        const vkAddressMatch = vkDeployOutput.stdout
            .trim()
            .match(/(0x[a-fA-F0-9]{40})/)
        if (!vkAddressMatch) {
            return false
        }
        const vkAddress = vkAddressMatch[1]

        const { circuit } = config.constants
        const arch = os.arch().includes('arm') ? 'arm' : 'default'
        const isArm = arch === 'arm'
        const { zkeys } = config.constants.snark[circuit]
        const witnessgen = config.constants.snark[circuit].witness[arch]
        const subsidyEnabled = data.subsidy && data.subsidy.enabled
        const subsidyZkeyFilePath = subsidyEnabled
            ? ` --subsidy-zkey "${zkeys.subsidy}"`
            : ''
        const subsidyResultFilePath = subsidyEnabled
            ? ` --subsidy-file subsidy.json`
            : ''

        const setVerifyingKeysCommand =
            `node build/index.js setVerifyingKeys` +
            ` -s ${config.constants.maci.stateTreeDepth}` +
            ` -i ${config.constants.poll.intStateTreeDepth}` +
            ` -m ${config.constants.maci.messageTreeDepth}` +
            ` -v ${config.constants.maci.voteOptionTreeDepth}` +
            ` -b ${config.constants.poll.messageBatchDepth}` +
            ` -p "${zkeys.process}"` +
            ` -t "${zkeys.tally}"` +
            ` -k ${vkAddress}` +
            ` ${subsidyZkeyFilePath}`

        execute(setVerifyingKeysCommand)

        // Run the create subcommand
        const createCommand = `node build/index.js create` + ` -r ${vkAddress}`
        const createOutput = execute(createCommand).stdout.trim()
        const regMatch = createOutput.match(/MACI: (0x[a-fA-F0-9]{40})/)
        const maciAddress = regMatch[1]

        const deployPollCommand =
            `node build/index.js deployPoll` +
            ` -x ${maciAddress}` +
            ` -pk ${coordinatorKeypair.pubKey.serialize()}` +
            ` -t ${config.constants.poll.duration}` +
            ` -g ${config.constants.maci.maxMessages}` +
            ` -mv ${config.constants.maci.maxVoteOptions}` +
            ` -i ${config.constants.poll.intStateTreeDepth}` +
            ` -m ${config.constants.poll.messageTreeDepth}` +
            ` -b ${config.constants.poll.messageBatchDepth}` +
            ` -v ${config.constants.maci.voteOptionTreeDepth}`

        const deployPollOutput = execute(deployPollCommand).stdout.trim()
        const deployPollIdRegMatch = deployPollOutput.match(/Poll ID: ([0-9])/)
        const pollId = deployPollIdRegMatch[1]
        const deployPollMPRegMatch = deployPollOutput.match(
            /MessageProcessor contract: (0x[a-fA-F0-9]{40})/,
        )
        const mpAddress = deployPollMPRegMatch[1]
        const deployPollTallyRegMatch = deployPollOutput.match(
            /Tally contract: (0x[a-fA-F0-9]{40})/,
        )
        const tallyAddress = deployPollTallyRegMatch[1]

        let subsidyAddress
        const deployPollSubsidyRegMatch = deployPollOutput.match(
            /Subsidy contract: (0x[a-fA-F0-9]{40})/,
        )
        const subsidyContract = deployPollSubsidyRegMatch[1]
        subsidyEnabled
            ? (subsidyAddress = '--subsidy ' + subsidyContract)
            : (subsidyAddress = '')

        const treeDepths = {} as TreeDepths
        treeDepths.intStateTreeDepth = config.constants.poll.intStateTreeDepth
        treeDepths.messageTreeDepth = config.constants.poll.messageTreeDepth
        treeDepths.messageTreeSubDepth = config.constants.poll.messageBatchDepth
        treeDepths.voteOptionTreeDepth =
            config.constants.maci.voteOptionTreeDepth

        const maxValues = {} as MaxValues
        maxValues.maxMessages = config.constants.maci.maxMessages
        maxValues.maxVoteOptions = config.constants.maci.maxVoteOptions
        const messageBatchSize = 5 ** config.constants.poll.messageBatchDepth
        maciState.deployPoll(
            config.constants.poll.duration,
            BigInt(Date.now() + config.constants.poll.duration * 60000),
            maxValues,
            treeDepths,
            messageBatchSize,
            coordinatorKeypair,
        )

        const userKeypairs: Keypair[] = []

        console.log(`Signing up ${data.numUsers} users`)

        const users = genTestUserCommands(
            data.numUsers,
            config.defaultVote.voiceCreditBalance,
            data.numVotesPerUser,
            data.bribers,
            data.votes,
        )

        // Sign up
        for (let i = 0; i < users.length; i++) {
            const userKeypair = users[i].keypair
            userKeypairs.push(userKeypair)
            // Run the signup command
            const signupCommand =
                `node build/index.js signup` +
                ` -p ${userKeypair.pubKey.serialize()}` +
                ` -x ${maciAddress}`
            execute(signupCommand)

            maciState.signUp(
                userKeypair.pubKey,
                BigInt(config.constants.maci.initialVoiceCredits),
                BigInt(Date.now()),
            )
        }

        // Publish messages
        console.log(`Publishing messages`)

        for (let i = 0; i < users.length; i++) {
            if (i >= userKeypairs.length) {
                continue
            }

            for (let j = 0; j < users[i].votes.length; j++) {
                // find which vote index the user should change keys
                const isKeyChange =
                    data.changeUsersKeys && j in data.changeUsersKeys[i]
                const stateIndex = i + 1
                const voteOptionIndex = isKeyChange
                    ? data.changeUsersKeys[i][j].voteOptionIndex
                    : users[i].votes[j].voteOptionIndex
                const newVoteWeight = isKeyChange
                    ? data.changeUsersKeys[i][j].voteWeight
                    : users[i].votes[j].voteWeight
                const nonce = users[i].votes[j].nonce
                const salt = '0x' + genRandomSalt().toString(16)
                const userPrivKey = isKeyChange
                    ? users[i].changeKeypair()
                    : userKeypairs[i].privKey
                const userKeypair = userKeypairs[i]
                // Run the publish command
                const publishCommand =
                    `node build/index.js publish` +
                    ` -sk ${userPrivKey.serialize()}` +
                    ` -p ${userKeypair.pubKey.serialize()}` +
                    ` -x ${maciAddress}` +
                    ` -i ${stateIndex}` +
                    ` -v ${voteOptionIndex}` +
                    ` -w ${newVoteWeight}` +
                    ` -n ${nonce}` +
                    ` -o ${pollId}`
                const publishOutput = execute(publishCommand).stdout.trim()
                const publishRegMatch = publishOutput.match(
                    /Transaction hash: (0x[a-fA-F0-9]{64})\nEphemeral private key: (macisk.[a-f0-9]+)$/,
                )

                // The publish command generates and outputs a random ephemeral private
                // key, so we have to retrieve it from the standard output
                const encPrivKey = PrivKey.unserialize(publishRegMatch[2])
                const encPubKey = new PubKey(genPubKey(encPrivKey.rawPrivKey))

                const command = new PCommand(
                    BigInt(stateIndex),
                    userKeypair.pubKey,
                    BigInt(voteOptionIndex),
                    BigInt(newVoteWeight),
                    BigInt(nonce),
                    BigInt(pollId),
                    BigInt(salt),
                )

                const signature = command.sign(userKeypair.privKey)

                const message = command.encrypt(
                    signature,
                    Keypair.genEcdhSharedKey(
                        encPrivKey,
                        coordinatorKeypair.pubKey,
                    ),
                )
                maciState.polls[pollId].publishMessage(message, encPubKey)
            }
        }

        const timeTravelCommand = `node build/index.js timeTravel -s ${config.constants.poll.duration}`
        execute(timeTravelCommand)

        const mergeMessagesCommand = `node build/index.js mergeMessages -x ${maciAddress} -o ${pollId}`
        execute(mergeMessagesCommand)

        const mergeSignupsCommand = `node build/index.js mergeSignups -x ${maciAddress} -o ${pollId}`
        execute(mergeSignupsCommand)

        const removeOldProofs = `rm -rf tally.json subsidy.json proofs/`
        execute(removeOldProofs)

        const genProofSubsidyArgument = subsidyEnabled
            ? subsidyZkeyFilePath +
              ` ${subsidyResultFilePath}` +
              (isArm ? ' -sw ' : ' -ws ') +
              `"${witnessgen.subsidy}"`
            : ''

        const genProofsCommand =
            `node build/index.js genProofs` +
            ` -x ${maciAddress}` +
            ` -sk ${coordinatorKeypair.privKey.serialize()}` +
            ` -o ${pollId}` +
            (isArm ? '' : ` -r "${witnessgen.prover}"`) +
            (isArm ? ' -pw ' : ' -wp ') +
            `"${witnessgen.process}"` +
            (isArm ? ' -tw ' : ' -wt ') +
            `"${witnessgen.tally}"` +
            ` -zp "${zkeys.process}"` +
            ` -zt "${zkeys.tally}"` +
            ` -t tally.json` +
            ` -f proofs/` +
            ` ${genProofSubsidyArgument}`
        execute(genProofsCommand)

        const tally = JSON.parse(
            fs
                .readFileSync(path.join(__dirname, '../../../cli/tally.json'))
                .toString(),
        )
        // Validate generated proof file
        expect(JSON.stringify(tally.pollId)).toEqual(pollId)
        expectTally(
            config.constants.maci.maxMessages,
            data.expectedTally,
            data.expectedSpentVoiceCredits,
            data.expectedTotalSpentVoiceCredits,
            tally,
        )
        if (subsidyEnabled) {
            const subsidy = JSON.parse(
                fs
                    .readFileSync(
                        path.join(__dirname, '../../../cli/subsidy.json'),
                    )
                    .toString(),
            )
            // Validate generated proof file
            expect(JSON.stringify(subsidy.pollId)).toEqual(pollId)
            expectSubsidy(
                config.constants.maci.maxMessages,
                data.subsidy.expectedSubsidy,
                subsidy,
            )
        }

        const proveOnChainCommand =
            `node build/index.js proveOnChain` +
            ` -x ${maciAddress}` +
            ` -o ${pollId}` +
            ` --mp ${mpAddress}` +
            ` --tally ${tallyAddress}` +
            ` -f proofs/` +
            ` ${subsidyAddress}`
        execute(proveOnChainCommand)

        const verifyCommand =
            `node build/index.js verify` +
            ` -x ${maciAddress}` +
            ` -o ${pollId}` +
            ` -t tally.json` +
            ` ${subsidyResultFilePath}`
        execute(verifyCommand)

        for (let i = 0; i < data.expectedTally.length; i++) {
            if (data.expectedTally[i] > 0) {
                const verifyResultCommand =
                    `node build/index.js verifyTallyResult` +
                    ` -x ${maciAddress}` +
                    ` -o ${pollId}` +
                    ` -v ${i}` +
                    ` -t tally.json`
                execute(verifyResultCommand)

                const verifyVoiceCreditsCommand =
                    `node build/index.js verifyPerVOSpentVoiceCredits` +
                    ` -x ${maciAddress}` +
                    ` -o ${pollId}` +
                    ` -v ${i}` +
                    ` -t tally.json`
                execute(verifyVoiceCreditsCommand)
            }
        }

        if (data.testDeployPollByNonOwner) {
            const pollId = await deployPollByRandomUser(maciAddress, config)
            console.log('pollId', pollId)
            expect(pollId).toEqual(-1)
        }
    } catch (e) {
        console.error(e)
        return false
    }

    return true
}

export { loadData, execute, executeSuite }
