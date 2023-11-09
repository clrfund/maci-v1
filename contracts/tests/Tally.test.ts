import {
    deployMockVerifier,
    deployPoseidonContracts,
    linkPoseidonLibraries,
} from '../'
import { expect } from 'chai'
import { Contract } from 'ethers'

const dummyProof = [
    ['0', '0', '0', '0'],
    ['0', '0', '0', '0'],
    ['0', '0', '0', '0'],
]

const validProof = [
    ['0', '0', '0', '0'],
    [
        '14655542659562014735865511769057053982292279840403315552050801315682099828156',
        '14655542659562014735865511769057053982292279840403315552050801315682099828156',
        '14655542659562014735865511769057053982292279840403315552050801315682099828156',
        '14655542659562014735865511769057053982292279840403315552050801315682099828156',
    ],
    [
        '19261153649140605024552417994922546473530072875902678653210025980873274131905',
        '19261153649140605024552417994922546473530072875902678653210025980873274131905',
        '19261153649140605024552417994922546473530072875902678653210025980873274131905',
        '19261153649140605024552417994922546473530072875902678653210025980873274131905',
    ],
]

const voteOptionIndex = 0
const voteOptionTreeDepth = 3
const tallyCommitment =
    '0x2082d7e946ce7911024890fe6b666d4639c93d20cc123e0c1de4e3818eb91bc0'
const resultCommitment =
    '4437829549824290654876084404089258773573261845788008403942790632833152451081'
const spentVoiceCreditsHash =
    '7935973537866563283861565313689273208978848662501950898374975309151483810569'
const perVOSpentVoiceCreditsHash =
    '1621973617833019826651087427028628870015650123025950413226627546787765255690'

const spent = 4
const spentSalt =
    '0x7c74d39d0c3ae0ad355a94e2c14b294dba08ab1fc4fb003828efc22973cef68'
const totalSpent = 4
const totalSpentSalt =
    '0x50d8ca94a18e96fc4c4a7de2e6754604b2af06a227ce49db287968229a597e1'
const tallyResult = 4
const tallyResultSalt =
    '0x1afcf28bf55e0046dd624876e2ba347addff55c03a39f7645c5140a97b258e62'

describe('Tally', () => {
    let tallyContract: Contract
    before(async () => {
        const {
            PoseidonT3Contract,
            PoseidonT4Contract,
            PoseidonT5Contract,
            PoseidonT6Contract,
        } = await deployPoseidonContracts(true)

        // Link Poseidon contracts
        const tallyContractFactory = await linkPoseidonLibraries(
            'Tally',
            PoseidonT3Contract.address,
            PoseidonT4Contract.address,
            PoseidonT5Contract.address,
            PoseidonT6Contract.address,
            true,
        )

        const mockVerifier = await deployMockVerifier()
        tallyContract = await tallyContractFactory.deploy(mockVerifier.address)
        await tallyContract.deployTransaction.wait()
    })

    describe('verifySpentVoiceCredits', () => {
        it('should correctly verify spent voice credits', async () => {
            const isValid = await tallyContract.verifySpentVoiceCredits(
                totalSpent,
                totalSpentSalt,
                resultCommitment,
                perVOSpentVoiceCreditsHash,
                tallyCommitment,
            )

            expect(isValid).to.eq(true)
        })

        it('should returns false for invalid spent voice credits', async () => {
            const isValid = await tallyContract.verifySpentVoiceCredits(
                0,
                0,
                0,
                0,
                0,
            )

            expect(isValid).to.eq(false)
        })
    })

    describe('verifyPerVOSpentVoiceCredits', () => {
        it('should correctly verify valid data', async () => {
            const isValid = await tallyContract.verifyPerVOSpentVoiceCredits(
                voteOptionIndex,
                spent,
                validProof,
                spentSalt,
                voteOptionTreeDepth,
                spentVoiceCreditsHash,
                resultCommitment,
                tallyCommitment,
            )
            expect(isValid).to.eq(true)
        })

        it('should return false for invalid data', async () => {
            const isValid = await tallyContract.verifyPerVOSpentVoiceCredits(
                0,
                0,
                dummyProof,
                0,
                0,
                0,
                0,
                0,
            )
            expect(isValid).to.eq(false)
        })
    })

    describe('verifyTallyResult', () => {
        it('should correctly verify valid data', async () => {
            const isValid = await tallyContract.verifyTallyResult(
                voteOptionIndex,
                tallyResult,
                validProof,
                tallyResultSalt,
                voteOptionTreeDepth,
                spentVoiceCreditsHash,
                perVOSpentVoiceCreditsHash,
                tallyCommitment,
            )
            expect(isValid).to.eq(true)
        })

        it('should return false for invalid data', async () => {
            const isValid = await tallyContract.verifyTallyResult(
                0,
                0,
                dummyProof,
                0,
                voteOptionTreeDepth,
                0,
                0,
                0,
            )
            expect(isValid).to.eq(false)
        })
    })
})
