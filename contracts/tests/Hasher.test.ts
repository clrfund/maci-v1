require('module-alias/register')
import {
    sha256Hash,
    hashLeftRight,
    hash3,
    hash4,
    hash5,
    genRandomSalt,
} from '@clrfund/maci-crypto'
import { expect } from 'chai'
import { deployPoseidonContracts, linkPoseidonLibraries } from '../'

let hasherContract

describe('Hasher', () => {
    before(async () => {
        const { PoseidonT3Contract, PoseidonT4Contract, PoseidonT5Contract, PoseidonT6Contract } = await deployPoseidonContracts(true)
        const hasherContractFactory = await linkPoseidonLibraries(
			'Hasher',
			PoseidonT3Contract.address,
			PoseidonT4Contract.address,
			PoseidonT5Contract.address,
			PoseidonT6Contract.address,
            true
        )

        hasherContract = await hasherContractFactory.deploy()
		await hasherContract.deployTransaction.wait()
    })

    it('maci-crypto.sha256Hash should match hasher.sha256Hash', async () => {
        const values: string[] = []
        for (let i = 0; i < 5; i++) {
            values.push(genRandomSalt().toString())
            const hashed = sha256Hash(values.map(BigInt))

            const onChainHash = await hasherContract.sha256Hash(values)
            expect(onChainHash.toString()).to.eq(hashed.toString())
        }
    })

    it('maci-crypto.hashLeftRight should match hasher.hashLeftRight', async () => {
        const left = genRandomSalt()
        const right = genRandomSalt()
        const hashed = hashLeftRight(left, right)

        const onChainHash = await hasherContract.hashLeftRight(left.toString(), right.toString())
        expect(onChainHash.toString()).to.eq(hashed.toString())
    })

    it('maci-crypto.hash3 should match hasher.hash3', async () => {
        const values: string[] = []
        for (let i = 0; i < 3; i++) {
            values.push(genRandomSalt().toString())
        }
        const hashed = hash3(values.map(BigInt))

        const onChainHash = await hasherContract.hash3(values)
        expect(onChainHash.toString()).to.eq(hashed.toString())
    })

    it('maci-crypto.hash4 should match hasher.hash4', async () => {
        const values: string[] = []
        for (let i = 0; i < 4; i++) {
            values.push(genRandomSalt().toString())
        }
        const hashed = hash4(values.map(BigInt))

        const onChainHash = await hasherContract.hash4(values)
        expect(onChainHash.toString()).to.eq(hashed.toString())
    })

    it('maci-crypto.hash5 should match hasher.hash5', async () => {
        const values: string[] = []
        for (let i = 0; i < 5; i++) {
            values.push(genRandomSalt().toString())
        }
        const hashed = hash5(values.map(BigInt))

        const onChainHash = await hasherContract.hash5(values)
        expect(onChainHash.toString()).to.eq(hashed.toString())
    })
})
