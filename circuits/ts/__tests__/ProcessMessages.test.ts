import * as fs from 'fs'

import {
    MaciState,
    STATE_TREE_DEPTH,
} from '@clrfund/maci-core'

import {
    PrivKey,
    Keypair,
    PCommand,
    Message,
    Ballot,
} from '@clrfund/maci-domainobjs'

import {
    hash5,
    IncrementalQuinTree,
    stringifyBigInts,
    NOTHING_UP_MY_SLEEVE,
} from '@clrfund/maci-crypto'

import { 
    getSignal,
} from './utils'
import * as path from 'path'
import { expect } from 'chai'
const tester = require("circom_tester").wasm

const voiceCreditBalance = BigInt(100)

const duration = 30
const maxValues = {
    maxUsers: 25,
    maxMessages: 25,
    maxVoteOptions: 25,
}

const treeDepths = {
    intStateTreeDepth: 2,
    messageTreeDepth: 2,
    messageTreeSubDepth: 1,
    voteOptionTreeDepth: 2,
}

const messageBatchSize = 5

const coordinatorKeypair = new Keypair()

describe('ProcessMessage circuit', function() {
    this.timeout(90000)

    let circuit: any 
    let hasherCircuit: any

    before(async () => {
        const circuitPath = path.join(__dirname, '../../circom/test', `processMessages_test.circom`)
        circuit = await tester(circuitPath)
        const hasherCircuitPath = path.join(__dirname, '../../circom/test', `processMessagesInputHasher_test.circom`)
        hasherCircuit = await tester(hasherCircuitPath)
    })

    describe('1 user, 2 messages', () => {
        const maciState = new MaciState()
        const voteWeight = BigInt(9)
        const voteOptionIndex = BigInt(0)
        let stateIndex
        let pollId
        let poll
        const messages: Message[] = []
        const commands: PCommand[] = []

        before(async () => {
            // Sign up and publish
            const userKeypair = new Keypair(new PrivKey(BigInt(1)))
            stateIndex = maciState.signUp(
                userKeypair.pubKey,
                voiceCreditBalance,
                // BigInt(1), 
                BigInt(Math.floor(Date.now() / 1000)),
            )

            maciState.stateAq.mergeSubRoots(0)
            maciState.stateAq.merge(STATE_TREE_DEPTH)

            pollId = maciState.deployPoll(
                duration,
                // BigInt(2 + duration), 
                BigInt(Math.floor(Date.now() / 1000) + duration),
                maxValues,
                treeDepths,
                messageBatchSize,
                coordinatorKeypair,
            )

            poll = maciState.polls[pollId]

            // First command (valid)
            const command = new PCommand(
                stateIndex, //BigInt(1),
                userKeypair.pubKey,
                voteOptionIndex, // voteOptionIndex,
                voteWeight, // vote weight
                BigInt(2), // nonce
                BigInt(pollId),
            )

            const signature = command.sign(userKeypair.privKey)

            const ecdhKeypair = new Keypair()
            const sharedKey = Keypair.genEcdhSharedKey(
                ecdhKeypair.privKey,
                coordinatorKeypair.pubKey,
            )
            const message = command.encrypt(signature, sharedKey)
            messages.push(message)
            commands.push(command)

            poll.publishMessage(message, ecdhKeypair.pubKey)

            // Second command (valid)
            const command2 = new PCommand(
                stateIndex,
                userKeypair.pubKey,
                voteOptionIndex, // voteOptionIndex,
                BigInt(1), // vote weight
                BigInt(1), // nonce
                BigInt(pollId),
            )
            const signature2 = command2.sign(userKeypair.privKey)

            const ecdhKeypair2 = new Keypair()
            const sharedKey2 = Keypair.genEcdhSharedKey(
                ecdhKeypair2.privKey,
                coordinatorKeypair.pubKey,
            )
            const message2 = command2.encrypt(signature2, sharedKey2)
            messages.push(message2)
            commands.push(command2)
            poll.publishMessage(message2, ecdhKeypair2.pubKey)

            poll.messageAq.mergeSubRoots(0)
            poll.messageAq.merge(treeDepths.messageTreeDepth)

            expect(poll.messageTree.root.toString())
                .to.be.eq(
                    poll.messageAq.getRoot(
                        treeDepths.messageTreeDepth,
                    ).toString()
                )
        })

        it('should produce the correct state root and ballot root', async () => {
            // The current roots
            const emptyBallot = new Ballot(
                poll.maxValues.maxVoteOptions,
                poll.treeDepths.voteOptionTreeDepth,
            )
            const emptyBallotHash = emptyBallot.hash()
            const ballotTree = new IncrementalQuinTree(
                STATE_TREE_DEPTH,
                emptyBallot.hash(),
                poll.STATE_TREE_ARITY,
                hash5,
            )

            ballotTree.insert(emptyBallot.hash())

            for (let i = 0; i < poll.stateLeaves.length; i ++) {
                ballotTree.insert(emptyBallotHash)
            }
            const currentStateRoot = maciState.stateTree.root
            const currentBallotRoot = ballotTree.root

            const generatedInputs = poll.processMessages(pollId)
                        
            // Calculate the witness
            const witness = await circuit.calculateWitness(generatedInputs, true)
            await circuit.checkConstraints(witness)

            // The new roots, which should differ, since at least one of the
            // messages modified a Ballot or State Leaf
            const newStateRoot = poll.stateTree.root
            const newBallotRoot = poll.ballotTree.root

            expect(newStateRoot.toString()).not.to.be.eq(currentStateRoot.toString())
            expect(newBallotRoot.toString()).not.to.be.eq(currentBallotRoot.toString())

            fs.writeFileSync(
                'input.json',
                JSON.stringify(generatedInputs) 
            )

            fs.writeFileSync(
                'witness.json',
                JSON.stringify(witness) 
            )

            const packedVals = MaciState.packProcessMessageSmallVals(
                BigInt(maxValues.maxVoteOptions),
                poll.numSignUps,
                0,
                2,
            )

            // Test the ProcessMessagesInputHasher circuit
            const hasherCircuitInputs = stringifyBigInts({
                packedVals,
                coordPubKey: generatedInputs.coordPubKey,
                msgRoot: generatedInputs.msgRoot,
                currentSbCommitment: generatedInputs.currentSbCommitment,
                newSbCommitment: generatedInputs.newSbCommitment,
                pollEndTimestamp: generatedInputs.pollEndTimestamp,
            })

            const hasherWitness = await hasherCircuit.calculateWitness(hasherCircuitInputs, true)
            await circuit.checkConstraints(witness)
            const hash = await getSignal(hasherCircuit, hasherWitness, 'hash')
            expect(hash.toString()).to.be.eq(generatedInputs.inputHash.toString())
        })
    })

    describe('2 users, 1 message', () => {
        const maciState = new MaciState()
        let pollId
        let poll
        const messages: Message[] = []
        const commands: PCommand[] = []

        before(async () => {
            // Sign up and publish
            const userKeypair = new Keypair(new PrivKey(BigInt(123)))
            const userKeypair2 = new Keypair(new PrivKey(BigInt(456)))

            maciState.signUp(
                userKeypair.pubKey,
                voiceCreditBalance,
                BigInt(1), //BigInt(Math.floor(Date.now() / 1000)),
            )
            maciState.signUp(
                userKeypair2.pubKey,
                voiceCreditBalance,
                BigInt(1), //BigInt(Math.floor(Date.now() / 1000)),
            )

            maciState.stateAq.mergeSubRoots(0)
            maciState.stateAq.merge(STATE_TREE_DEPTH)

            pollId = maciState.deployPoll(
                duration,
                BigInt(2 + duration), //BigInt(Math.floor(Date.now() / 1000) + duration),
                maxValues,
                treeDepths,
                messageBatchSize,
                coordinatorKeypair,
            )

            poll = maciState.polls[pollId]

            const command = new PCommand(
                BigInt(1),
                userKeypair.pubKey,
                BigInt(0), // voteOptionIndex,
                BigInt(1), // vote weight
                BigInt(1), // nonce
                BigInt(pollId),
            )

            const signature = command.sign(userKeypair.privKey)

            const ecdhKeypair = new Keypair()
            const sharedKey = Keypair.genEcdhSharedKey(
                ecdhKeypair.privKey,
                coordinatorKeypair.pubKey,
            )
            const message = command.encrypt(signature, sharedKey)
            messages.push(message)
            commands.push(command)

            poll.publishMessage(message, ecdhKeypair.pubKey)

            // Merge
            poll.messageAq.mergeSubRoots(0)
            poll.messageAq.merge(treeDepths.messageTreeDepth)

            expect(poll.messageTree.root.toString())
                .to.be.eq(
                    poll.messageAq.getRoot(
                        treeDepths.messageTreeDepth,
                    ).toString()
                )
        })

        it('should produce the correct state root and ballot root', async () => {
            // The current roots
            const emptyBallot = new Ballot(
                poll.maxValues.maxVoteOptions,
                poll.treeDepths.voteOptionTreeDepth,
            )
            const emptyBallotHash = emptyBallot.hash()
            const ballotTree = new IncrementalQuinTree(
                STATE_TREE_DEPTH,
                emptyBallot.hash(),
                poll.STATE_TREE_ARITY,
                hash5,
            )

            ballotTree.insert(emptyBallot.hash())

            for (let i = 0; i < poll.stateLeaves.length; i ++) {
                ballotTree.insert(emptyBallotHash)
            }
            const currentStateRoot = maciState.stateTree.root
            const currentBallotRoot = ballotTree.root

            const generatedInputs = poll.processMessages(pollId)

            // Calculate the witness
   
            const witness = await circuit.calculateWitness(generatedInputs,)
            await circuit.checkConstraints(witness)

            // The new roots, which should differ, since at least one of the
            // messages modified a Ballot or State Leaf
            const newStateRoot = poll.stateTree.root
            const newBallotRoot = poll.ballotTree.root

            expect(newStateRoot.toString()).not.to.be.eq(currentStateRoot.toString())
            expect(newBallotRoot.toString()).not.to.be.eq(currentBallotRoot.toString())
        })
    })
 
    describe('1 user, key-change', () => {
        const maciState = new MaciState()
        const voteWeight = BigInt(9)
        const voteOptionIndex = BigInt(0)
        let stateIndex
        let pollId
        let poll
        const messages: Message[] = []
        const commands: PCommand[] = []

        before(async () => {
            // Sign up and publish
            const userKeypair = new Keypair(new PrivKey(BigInt(123)))
            const userKeypair2 = new Keypair(new PrivKey(BigInt(456)))

            stateIndex = maciState.signUp(
                userKeypair.pubKey,
                voiceCreditBalance,
                BigInt(1), //BigInt(Math.floor(Date.now() / 1000)),
            )

            maciState.stateAq.mergeSubRoots(0)
            maciState.stateAq.merge(STATE_TREE_DEPTH)

            pollId = maciState.deployPoll(
                duration,
                BigInt(2 + duration), //BigInt(Math.floor(Date.now() / 1000) + duration),
                maxValues,
                treeDepths,
                messageBatchSize,
                coordinatorKeypair,
            )

            poll = maciState.polls[pollId]

            // Vote for option 0
            const command = new PCommand(
                stateIndex, //BigInt(1),
                userKeypair.pubKey,
                BigInt(0), // voteOptionIndex,
                voteWeight, // vote weight
                BigInt(1), // nonce
                BigInt(pollId),
            )

            const signature = command.sign(userKeypair.privKey)
            //0onsole.log('sig1 generated with', userKeypair.pubKey.rawPubKey[0], 'sig', signature)

            const ecdhKeypair = new Keypair()
            const sharedKey = Keypair.genEcdhSharedKey(
                ecdhKeypair.privKey,
                coordinatorKeypair.pubKey,
            )
            const message = command.encrypt(signature, sharedKey)
            messages.push(message)
            commands.push(command)

            poll.publishMessage(message, ecdhKeypair.pubKey)

            // Vote for option 1
            const command2 = new PCommand(
                stateIndex,
                userKeypair2.pubKey,
                BigInt(1), // voteOptionIndex,
                voteWeight, // vote weight
                BigInt(2), // nonce
                BigInt(pollId),
            )
            const signature2 = command2.sign(userKeypair2.privKey)
            //console.log('sig2 generated with', userKeypair2.pubKey.rawPubKey[0], 'sig', signature2)

            const ecdhKeypair2 = new Keypair()
            const sharedKey2 = Keypair.genEcdhSharedKey(
                ecdhKeypair2.privKey,
                coordinatorKeypair.pubKey,
            )
            const message2 = command2.encrypt(signature2, sharedKey2)
            messages.push(message2)
            commands.push(command2)
            poll.publishMessage(message2, ecdhKeypair2.pubKey)

            // Change key
            const command3 = new PCommand(
                stateIndex, //BigInt(1),
                userKeypair2.pubKey,
                BigInt(1), // voteOptionIndex,
                BigInt(0), // vote weight
                BigInt(1), // nonce
                BigInt(pollId),
            )

            const signature3 = command3.sign(userKeypair.privKey)
            //console.log('sig3 generated with', userKeypair.pubKey.rawPubKey[0], 'sig', signature3)

            const ecdhKeypair3 = new Keypair()
            const sharedKey3 = Keypair.genEcdhSharedKey(
                ecdhKeypair3.privKey,
                coordinatorKeypair.pubKey,
            )
            const message3 = command3.encrypt(signature3, sharedKey3)
            messages.push(message3)
            commands.push(command3)
            poll.publishMessage(message3, ecdhKeypair3.pubKey)

            // Merge
            poll.messageAq.mergeSubRoots(0)
            poll.messageAq.merge(treeDepths.messageTreeDepth)

            expect(poll.messageTree.root.toString())
                .to.be.eq(
                    poll.messageAq.getRoot(
                        treeDepths.messageTreeDepth,
                    ).toString()
                )
        })

        it('should produce the correct state root and ballot root', async () => {
            // The current roots
            const emptyBallot = new Ballot(
                poll.maxValues.maxVoteOptions,
                poll.treeDepths.voteOptionTreeDepth,
            )
            const emptyBallotHash = emptyBallot.hash()
            const ballotTree = new IncrementalQuinTree(
                STATE_TREE_DEPTH,
                emptyBallot.hash(),
                poll.STATE_TREE_ARITY,
                hash5,
            )

            ballotTree.insert(NOTHING_UP_MY_SLEEVE)

            for (let i = 0; i < poll.stateLeaves.length; i ++) {
                ballotTree.insert(emptyBallotHash)
            }
            const currentStateRoot = maciState.stateTree.root
            const currentBallotRoot = ballotTree.root

            const generatedInputs = poll.processMessages(pollId)

            // Calculate the witness
            const witness = await circuit.calculateWitness(generatedInputs, true)
            await circuit.checkConstraints(witness)

            // The new roots, which should differ, since at least one of the
            // messages modified a Ballot or State Leaf
            const newStateRoot = poll.stateTree.root
            const newBallotRoot = poll.ballotTree.root

            expect(newStateRoot.toString()).not.to.be.eq(currentStateRoot.toString())
            expect(newBallotRoot.toString()).not.to.be.eq(currentBallotRoot.toString())
        })
    })

    const NUM_BATCHES = 2
    describe(`1 user, ${messageBatchSize * NUM_BATCHES} messages`, () => {
        it('should produce the correct state root and ballot root', async () => {
            const maciState = new MaciState()
            const userKeypair = new Keypair()
            const stateIndex = maciState.signUp(
                userKeypair.pubKey, 
                voiceCreditBalance,
                BigInt(Math.floor(Date.now() / 1000)),
            )

            maciState.stateAq.mergeSubRoots(0)
            maciState.stateAq.merge(STATE_TREE_DEPTH)
            // Sign up and publish
            const pollId = maciState.deployPoll(
                duration,
                BigInt(Math.floor(Date.now() / 1000) + duration),
                maxValues,
                treeDepths,
                messageBatchSize,
                coordinatorKeypair,
            )

            const poll = maciState.polls[pollId]

            // Second batch is not a full batch
            const numMessages = (messageBatchSize * NUM_BATCHES) - 1
            for (let i = 0; i < numMessages; i ++) {
                const command = new PCommand(
                    BigInt(stateIndex),
                    userKeypair.pubKey,
                    BigInt(i), //vote option index
                    BigInt(1), // vote weight
                    BigInt(numMessages - i), // nonce
                    BigInt(pollId),
                )

                const signature = command.sign(userKeypair.privKey)

                const ecdhKeypair = new Keypair()
                const sharedKey = Keypair.genEcdhSharedKey(
                    ecdhKeypair.privKey,
                    coordinatorKeypair.pubKey,
                )
                const message = command.encrypt(signature, sharedKey)
                poll.publishMessage(message, ecdhKeypair.pubKey)
            }

            poll.messageAq.mergeSubRoots(0)
            poll.messageAq.merge(treeDepths.messageTreeDepth)

            for (let i = 0; i < NUM_BATCHES; i ++) {
                const generatedInputs = poll.processMessages(pollId)

                const witness = await circuit.calculateWitness(generatedInputs, true)
                await circuit.checkConstraints(witness)

            }
        })
    })
})
