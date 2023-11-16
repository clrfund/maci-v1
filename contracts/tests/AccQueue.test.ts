require('module-alias/register')
import {
    IncrementalQuinTree,
    AccQueue,
    hashLeftRight,
    NOTHING_UP_MY_SLEEVE,
    hash2,
    hash5,
} from '@clrfund/maci-crypto'
import { deployPoseidonContracts, linkPoseidonLibraries } from '../ts/'
import { expect } from "chai";

const enqueueGasLimit = { gasLimit: 500000 }
const fillGasLimit = { gasLimit: 4000000 }
const insertSubTreeGasLimit = { gasLimit: 300000 }

const calcDepthFromNumLeaves = (
    hashLength: number,
    numLeaves: number,
) => {
    let depth = 1
    while (true) {
        const max = hashLength ** depth
        if (BigInt(max) >= numLeaves) {
            break
        }
        depth ++
    }

    return depth
}


const testEmptySubtree = async (aq: AccQueue, aqContract: any, index: number) => {
    aq.fill()
    const tx = await aqContract.fill(fillGasLimit)
    await tx.wait()
    const subRoot = await aqContract.getSubRoot(index)
    expect(subRoot.toString()).to.equal(aq.getSubRoot(index).toString())
}

/*
 * Insert one leaf and compute the subroot
 */
const testIncompleteSubtree = async (aq: AccQueue, aqContract: any) => {
    const leaf = BigInt(1)

    aq.enqueue(leaf)
    await (await aqContract.enqueue(leaf.toString(), enqueueGasLimit)).wait()

    aq.fill()
    await (await aqContract.fill(fillGasLimit)).wait()

    const subRoot = await aqContract.getSubRoot(1)
    expect(subRoot.toString()).to.equal(aq.getSubRoot(1).toString())
}

const testFillForAllIncompletes = async (
    aq: AccQueue,
    aqContract: any,
    HASH_LENGTH: number,
) => {
    for (let i = 0; i < HASH_LENGTH; i ++) {
        for (let j = 0; j < i; j ++) {
            const leaf = BigInt(i + 1)
            aq.enqueue(leaf)
            await (await aqContract.enqueue(leaf.toString(), enqueueGasLimit)).wait()
        }
        aq.fill()
        await (await aqContract.fill(fillGasLimit)).wait()

        const subRoot = await aqContract.getSubRoot(3 + i)
        expect(subRoot.toString()).to.equal(aq.getSubRoot(3 + i).toString())
    }
}

const testEmptyUponDeployment = async (aqContract: any) => {
    const numLeaves = await aqContract.numLeaves()
    expect(numLeaves.toString()).to.equal('0')

    await expect(aqContract.getSubRoot(0)).to.be.revertedWithCustomError(aqContract, "InvalidIndex")
}

/*
 * Enqueue leaves and check their subroots
 */
const testEnqueue = async (
    aqContract: any,
    HASH_LENGTH: number,
    SUB_DEPTH: number,
    ZERO: bigint,
) => {

    const hashFunc = HASH_LENGTH === 5 ? hash5 : hash2
    const tree0 = new IncrementalQuinTree(SUB_DEPTH, ZERO, HASH_LENGTH, hashFunc)
    const subtreeCapacity = HASH_LENGTH ** SUB_DEPTH

    // Insert up to a subtree
    for (let i = 0; i < subtreeCapacity; i ++) {
        const leaf = BigInt(i + 1)
        tree0.insert(leaf)

        const tx = await aqContract.enqueue(leaf.toString(), enqueueGasLimit)
        await tx.wait()
    }

    let numLeaves = await aqContract.numLeaves()
    expect(numLeaves.toString()).to.eq(subtreeCapacity.toString())

    const r = await aqContract.getSubRoot(0)
    expect(r.toString()).to.eq(tree0.root.toString())

    const tree1 = new IncrementalQuinTree(SUB_DEPTH, ZERO, HASH_LENGTH, hashFunc)

    // Insert the other subtree
    for (let i = 0; i < subtreeCapacity; i ++) {
        const leaf = BigInt(i + 2)
        tree1.insert(leaf)

        const tx = await aqContract.enqueue(leaf.toString(), enqueueGasLimit)
        await tx.wait()
    }

    numLeaves = await aqContract.numLeaves()
    expect(numLeaves.toString()).to.eq((subtreeCapacity * 2).toString())

    const subroot1 = await aqContract.getSubRoot(1)
    expect(subroot1.toString()).to.eq(tree1.root.toString())
}

/*
 * Insert subtrees directly
 */
const testInsertSubTrees = async (
    aq: AccQueue,
    aqContract: any,
    NUM_SUBTREES: number,
    MAIN_DEPTH: number,
) => {

    const leaves: bigint[] = []
    for (let i = 0; i < NUM_SUBTREES; i ++) {
        const subTree = new IncrementalQuinTree(aq.subDepth, aq.zeros[0], aq.hashLength, aq.hashFunc)
        const leaf = BigInt(i)
        subTree.insert(leaf)
        leaves.push(leaf)

        // insert the subtree root
        aq.insertSubTree(subTree.root)
        await (await aqContract.insertSubTree(subTree.root.toString(), insertSubTreeGasLimit)).wait()
    }

    let correctRoot: string
    if (NUM_SUBTREES === 1) {
        correctRoot = aq.subRoots[0].toString()
    } else {
        const depth = calcDepthFromNumLeaves(aq.hashLength, aq.subRoots.length)
        const tree = new IncrementalQuinTree(depth, aq.zeros[aq.subDepth], aq.hashLength, aq.hashFunc)
        for (const sr of aq.subRoots) {
            tree.insert(sr)
        }
        correctRoot = tree.root.toString()
    }

    // Check whether mergeSubRoots() works
    aq.mergeSubRoots(0)
    await (await aqContract.mergeSubRoots(0, { gasLimit: 8000000 })).wait()

    const expectedSmallSRTroot = aq.smallSRTroot.toString()

    expect(correctRoot).to.eq(expectedSmallSRTroot)

    const contractSmallSRTroot = await aqContract.getSmallSRTroot()
    expect(expectedSmallSRTroot.toString()).to.eq(contractSmallSRTroot.toString())

    // Check whether merge() works
    aq.merge(MAIN_DEPTH)
    await (await aqContract.merge(MAIN_DEPTH, { gasLimit: 8000000 })).wait()

    const expectedMainRoot = aq.mainRoots[MAIN_DEPTH]
    const contractMainRoot = await aqContract.getMainRoot(MAIN_DEPTH)

    expect(expectedMainRoot.toString()).to.eq(contractMainRoot.toString())
}

/*
 * The order of leaves when using enqueue() and insertSubTree() should be correct.
 */
const testEnqueueAndInsertSubTree = async (
    aq: AccQueue,
    aqContract: any,
) => {
    const z = aq.zeros[0]
    const n = BigInt(1)

    const leaves: bigint[] = []

    const subTree = new IncrementalQuinTree(aq.subDepth, z, aq.hashLength, aq.hashFunc)

    for (let i = 0; i < aq.hashLength ** aq.subDepth; i ++) {
        leaves.push(z)
    }

    leaves.push(n)
    // leaves is now [z, z, z, z..., n]

    const depth = calcDepthFromNumLeaves(aq.hashLength, leaves.length)
    const tree = new IncrementalQuinTree(depth, z, aq.hashLength, aq.hashFunc)
    for (const leaf of leaves) {
        tree.insert(leaf)
    }

    const expectedRoot = tree.root.toString()

    aq.enqueue(n)
    await (await aqContract.enqueue(n.toString(), enqueueGasLimit)).wait()

    aq.insertSubTree(subTree.root)
    await (await aqContract.insertSubTree(subTree.root.toString(), insertSubTreeGasLimit)).wait()

    aq.fill()
    await (await aqContract.fill(fillGasLimit)).wait()

    aq.mergeSubRoots(0)
    await (await aqContract.mergeSubRoots(0, { gasLimit: 8000000 })).wait()

    expect(expectedRoot).to.eq(aq.smallSRTroot.toString())

    const contractSmallSRTroot = await aqContract.getSmallSRTroot()
    expect(expectedRoot).to.eq(contractSmallSRTroot.toString())
}

/*
 * Insert a number of subtrees and merge them all into a main tree
 */
const testMerge = async (
    aq: AccQueue,
    aqContract: any,
    NUM_SUBTREES: number,
    MAIN_DEPTH: number,
) => {
    // The raw leaves of the main tree
    const leaves: bigint[] = []
    for (let i = 0; i < NUM_SUBTREES; i ++) {
        const leaf = BigInt(i)

        aq.enqueue(leaf)
        aq.fill()
        await (await aqContract.enqueue(leaf.toString(), enqueueGasLimit)).wait()
        await (await aqContract.fill(fillGasLimit)).wait()

        leaves.push(leaf)

        for (let i = 1; i < aq.hashLength ** aq.subDepth; i ++) {
            leaves.push(aq.zeros[0])
        }
    }

    // Insert leaves into a main tree
    const tree = new IncrementalQuinTree(MAIN_DEPTH, aq.zeros[0], aq.hashLength, aq.hashFunc)
    for (const leaf of leaves) {
        tree.insert(leaf)
    }

    // minHeight should be the small SRT height
    const minHeight = await aqContract.calcMinHeight()
    const c = calcDepthFromNumLeaves(aq.hashLength, NUM_SUBTREES)
    expect(minHeight.toString()).to.eq(c.toString())

    // Check whether mergeSubRoots() works
    aq.mergeSubRoots(0)
    await (await aqContract.mergeSubRoots(0, { gasLimit: 8000000 })).wait()

    const expectedSmallSRTroot = aq.smallSRTroot.toString()
    const contractSmallSRTroot = (await aqContract.getSmallSRTroot()).toString()

    expect(expectedSmallSRTroot).to.eq(contractSmallSRTroot)

    if (NUM_SUBTREES === 1) {
        expect(expectedSmallSRTroot).to.eq(aq.subRoots[0].toString())
    } else {
        // Check whether the small SRT root is correct
        const srtHeight = calcDepthFromNumLeaves(aq.hashLength, NUM_SUBTREES)
        const smallTree = new IncrementalQuinTree(srtHeight, aq.zeros[aq.subDepth], aq.hashLength, aq.hashFunc)
        for (const s of aq.subRoots) {
            smallTree.insert(s)
        }
        expect(expectedSmallSRTroot).to.eq(smallTree.root.toString())
    }

    // Check whether mergeDirect() works
    const aq2 = aq.copy()

    aq2.mergeDirect(MAIN_DEPTH)
    const directlyMergedRoot = aq2.mainRoots[MAIN_DEPTH].toString()
    expect(directlyMergedRoot.toString()).to.eq(tree.root.toString())

    // Check whether off-chain merge() works
    aq.merge(MAIN_DEPTH)

    const expectedMainRoot = aq.mainRoots[MAIN_DEPTH].toString()

    expect(expectedMainRoot).to.eq(directlyMergedRoot)

    // Check whether on-chain merge() works
    await (await aqContract.merge(MAIN_DEPTH, { gasLimit: 8000000 })).wait()
    const contractMainRoot = (await aqContract.getMainRoot(MAIN_DEPTH)).toString()
    expect(expectedMainRoot).to.eq(contractMainRoot)
}   

/*
 * Enqueue, merge, enqueue, and merge again
 */
const testMergeAgain = async (
    aq: AccQueue,
    aqContract: any,
    MAIN_DEPTH: number,
) => {
    const tree = new IncrementalQuinTree(MAIN_DEPTH, aq.zeros[0], aq.hashLength, aq.hashFunc)
    const leaf = BigInt(123)

    // Enqueue
    aq.enqueue(leaf)
    await (await aqContract.enqueue(leaf.toString())).wait()
    tree.insert(leaf)

    // Merge
    aq.mergeDirect(MAIN_DEPTH)
    await (await aqContract.mergeSubRoots(0, { gasLimit: 8000000 })).wait()
    await (await aqContract.merge(MAIN_DEPTH, { gasLimit: 8000000 })).wait()

    for (let i = 1; i < aq.hashLength ** aq.subDepth; i ++) {
        tree.insert(aq.zeros[0])
    }

    const mainRoot = (await aqContract.getMainRoot(MAIN_DEPTH)).toString()
    const expectedMainRoot = aq.mainRoots[MAIN_DEPTH].toString()
    expect(expectedMainRoot).to.eq(mainRoot)
    expect(expectedMainRoot).to.eq(tree.root.toString())

    const leaf2 = BigInt(456)

    // Enqueue
    aq.enqueue(leaf2)
    await (await aqContract.enqueue(leaf2.toString())).wait()
    tree.insert(leaf2)

    // Merge
    aq.mergeDirect(MAIN_DEPTH)
    await (await aqContract.mergeSubRoots(0, { gasLimit: 8000000 })).wait()
    await (await aqContract.merge(MAIN_DEPTH, { gasLimit: 8000000 })).wait()

    for (let i = 1; i < aq.hashLength ** aq.subDepth; i ++) {
        tree.insert(aq.zeros[0])
    }

    const mainRoot2 = (await aqContract.getMainRoot(MAIN_DEPTH)).toString()
    const expectedMainRoot2 = aq.mainRoots[MAIN_DEPTH].toString()
    expect(expectedMainRoot2).to.eq(tree.root.toString())

    expect(expectedMainRoot2).not.to.eq(expectedMainRoot)
    expect(expectedMainRoot2).to.eq(mainRoot2)
}

const deploy = async (
    contractName: string,
    SUB_DEPTH: number,
    HASH_LENGTH: number,
    ZERO: bigint,
) => {
    const { PoseidonT3Contract, PoseidonT4Contract, PoseidonT5Contract, PoseidonT6Contract } = await deployPoseidonContracts(true)
    // Link Poseidon contracts
	const AccQueueFactory = await linkPoseidonLibraries(
		contractName,
		PoseidonT3Contract.address,
		PoseidonT4Contract.address,
		PoseidonT5Contract.address,
		PoseidonT6Contract.address,
        true
	)

	const aqContract = await AccQueueFactory.deploy(
		SUB_DEPTH
	)

	await aqContract.deployTransaction.wait()

    const aq = new AccQueue(SUB_DEPTH, HASH_LENGTH, ZERO)
    return { aq, aqContract }
}

describe('AccQueues', () => {
    describe('Binary AccQueue enqueues', () => {
        const SUB_DEPTH = 2
        const HASH_LENGTH = 2
        const ZERO = BigInt(0)
        let aqContract

        before(async () => {
            const r = await deploy(
                'AccQueueBinary0',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )
            aqContract = r.aqContract
        })

        it('Should be empty upon deployment', async () => {
            await testEmptyUponDeployment(aqContract)
        })

        it('Should not be able to get a subroot that does not exist', async () => {
            await expect(aqContract.getSubRoot(0)).to.be.revertedWithCustomError(aqContract, "InvalidIndex")
        })

        it('Should enqueue leaves', async () => {
            await testEnqueue(
                aqContract,
                HASH_LENGTH,
                SUB_DEPTH,
                ZERO,
            )
        })
    })

    describe('Quinary AccQueue enqueues', () => {
        const SUB_DEPTH = 2
        const HASH_LENGTH = 5
        const ZERO = BigInt(0)
        let aqContract

        before(async () => {
            const r = await deploy(
                'AccQueueQuinary0',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )
            aqContract = r.aqContract
        })

        it('Should be empty upon deployment', async () => {
            await testEmptyUponDeployment(aqContract)
        })

        it('Should not be able to get a subroot that does not exist', async () => {
            await expect(aqContract.getSubRoot(0)).to.be.revertedWithCustomError(aqContract, "InvalidIndex")
        })

        it('Should enqueue leaves', async () => {
            await testEnqueue(
                aqContract,
                HASH_LENGTH,
                SUB_DEPTH,
                ZERO,
            )
        })
    })

    describe('Binary AccQueue0 fills', () => {
        const SUB_DEPTH = 2
        const HASH_LENGTH = 2
        const ZERO = BigInt(0)
        let aq: AccQueue
        let aqContract

        before(async () => {
            const r = await deploy(
                'AccQueueBinary0',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )
            aq = r.aq
            aqContract = r.aqContract
        })

        it('Should fill an empty subtree', async () => {
            await testEmptySubtree(aq, aqContract, 0)
        })

        it('Should fill an incomplete subtree', async () => {
            await testIncompleteSubtree(aq, aqContract)
        })

        it('Filling an empty subtree again should create the correct subroot', async () => {
            await testEmptySubtree(aq, aqContract, 2)
        })

        it('fill() should be correct for every number of leaves in an incomplete subtree', async () => {
            await testFillForAllIncompletes(aq, aqContract, HASH_LENGTH)
        })
    })

    describe('Quinary AccQueue0 fills', () => {
        const SUB_DEPTH = 2
        const HASH_LENGTH = 5
        const ZERO = BigInt(0)
        let aq: AccQueue
        let aqContract

        before(async () => {
            const r = await deploy(
                'AccQueueQuinary0',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )
            aq = r.aq
            aqContract = r.aqContract
        })

        it('Should fill an empty subtree', async () => {
            await testEmptySubtree(aq, aqContract, 0)
        })

        it('Should fill an incomplete subtree', async () => {
            await testIncompleteSubtree(aq, aqContract)
        })

        it('Filling an empty subtree again should create the correct subroot', async () => {
            await testEmptySubtree(aq, aqContract, 2)
        })

        it('fill() should be correct for every number of leaves in an incomplete subtree', async () => {
            await testFillForAllIncompletes(aq, aqContract, HASH_LENGTH)
        })
    })

    describe('Binary AccQueueMaci fills', () => {
        const SUB_DEPTH = 2
        const HASH_LENGTH = 2
        const ZERO = NOTHING_UP_MY_SLEEVE
        let aq: AccQueue
        let aqContract

        before(async () => {
            const r = await deploy(
                'AccQueueBinaryMaci',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )
            aq = r.aq
            aqContract = r.aqContract
        })

        it('Should fill an empty subtree', async () => {
            await testEmptySubtree(aq, aqContract, 0)
        })

        it('Should fill an incomplete subtree', async () => {
            await testIncompleteSubtree(aq, aqContract)
        })

        it('Filling an empty subtree again should create the correct subroot', async () => {
            await testEmptySubtree(aq, aqContract, 2)
        })

        it('fill() should be correct for every number of leaves in an incomplete subtree', async () => {
            await testFillForAllIncompletes(aq, aqContract, HASH_LENGTH)
        })
    })

    describe('Quinary AccQueueMaci fills', () => {
        const SUB_DEPTH = 2
        const HASH_LENGTH = 5
        const ZERO = NOTHING_UP_MY_SLEEVE
        let aq: AccQueue
        let aqContract

        before(async () => {
            const r = await deploy(
                'AccQueueQuinaryMaci',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )
            aq = r.aq
            aqContract = r.aqContract
        })

        it('Should fill an empty subtree', async () => {
            await testEmptySubtree(aq, aqContract, 0)
        })

        it('Should fill an incomplete subtree', async () => {
            await testIncompleteSubtree(aq, aqContract)
        })

        it('Filling an empty subtree again should create the correct subroot', async () => {
            await testEmptySubtree(aq, aqContract, 2)
        })

        it('fill() should be correct for every number of leaves in an incomplete subtree', async () => {
            await testFillForAllIncompletes(aq, aqContract, HASH_LENGTH)
        })
    })
  
    describe('Merge after enqueuing more leaves', () => {
        const SUB_DEPTH = 2
        const HASH_LENGTH = 2
        const ZERO = BigInt(0)
        const MAIN_DEPTH = 3

        it('Should produce the correct main roots', async () => {
            const r = await deploy(
                'AccQueueBinary0',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )
            const aq = r.aq
            const aqContract = r.aqContract
            await testMergeAgain(aq, aqContract, MAIN_DEPTH)
        })
    })

    describe('Edge cases', () => {
        const SUB_DEPTH = 2
        const HASH_LENGTH = 2
        const ZERO = BigInt(0)

        it('Should not be possible to merge if empty', async () => {
            const r = await deploy(
                'AccQueueBinary0',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )
            const aqContract = r.aqContract
            await expect(aqContract.mergeSubRoots(0, { gasLimit: 1000000 })).to.be.revertedWithCustomError(
                aqContract,
                "NothingToMerge"
            )
        })

        it('Should not be possible to merge into a tree of depth 0', async () => {
            const r = await deploy(
                'AccQueueBinary0',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )

            const aqContract = r.aqContract
            await (await aqContract.enqueue(1)).wait()
            await (await aqContract.mergeSubRoots(0, { gasLimit: 1000000 })).wait()
            await expect(aqContract.merge(0, { gasLimit: 1000000 })).to.revertedWithCustomError(
                aqContract,
                "DepthCannotBeZero"
            )
        })

        it('A small SRT of depth 1 should just have 2 leaves', async () => {
            const r = await deploy(
                'AccQueueBinary0',
                1,
                HASH_LENGTH,
                ZERO,
            )

            const aqContract = r.aqContract
            await (await aqContract.enqueue(0, enqueueGasLimit)).wait()
            await (await aqContract.mergeSubRoots(0, { gasLimit: 1000000 })).wait()
            const srtRoot = await aqContract.getSmallSRTroot()
            const expectedRoot = hashLeftRight(BigInt(0), BigInt(0))
            expect(srtRoot.toString()).to.eq(expectedRoot.toString())
        })

        it('Should not be possible to merge subroots into a tree shorter than the SRT depth', async () => {
            const r = await deploy(
                'AccQueueBinary0',
                1,
                HASH_LENGTH,
                ZERO,
            )
            const aqContract = r.aqContract
            for (let i = 0; i < 4; i ++) {
                await (await (aqContract.fill(fillGasLimit))).wait()
            }

            await (await aqContract.mergeSubRoots(0, { gasLimit: 1000000 })).wait()

            await expect(aqContract.merge(1, { gasLimit: 1000000 })).to.be.revertedWithCustomError(
                aqContract,
                "DepthTooSmall"
            )
        })

        it('Merging without enqueing new data should not change the root', async () => {
            const MAIN_DEPTH = 5
            const ZERO = BigInt(0)
    
            const r = await deploy(
                'AccQueueBinary0',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO
            )
    
            const aq = r.aq
            const aqContract = r.aqContract
            // Merge once
            await testMerge(aq, aqContract, 1, MAIN_DEPTH)
            // Get the root
            const expectedMainRoot = (await aqContract.getMainRoot(MAIN_DEPTH)).toString()   
            // Merge again 
            await (await aqContract.merge(MAIN_DEPTH, { gasLimit: 8000000 })).wait()
            // Get the root again 
            const root = (await aqContract.getMainRoot(MAIN_DEPTH)).toString()   
            // Check that the roots match
            expect(root).to.eq(expectedMainRoot)
        })
    })

    describe('Binary AccQueue0 one-shot merges', () => {
        const SUB_DEPTH = 2
        const MAIN_DEPTH = 5
        const HASH_LENGTH = 2
        const ZERO = BigInt(0)

        const testParams = [1, 2, 3, 4]
        testParams.forEach((testParam) => {
            it(`Should merge ${testParam} subtrees`, async () => {
                const r = await deploy(
                    'AccQueueBinary0',
                    SUB_DEPTH,
                    HASH_LENGTH,
                    ZERO,
                )
                const aq = r.aq
                const aqContract = r.aqContract
                await testMerge(aq, aqContract, testParam, MAIN_DEPTH)
            })
        })
    })

    describe('Quinary AccQueue0 one-shot merges', () => {
        const SUB_DEPTH = 2
        const MAIN_DEPTH = 6
        const HASH_LENGTH = 5
        const ZERO = BigInt(0)

        const testParams = [1, 5, 26]
        testParams.forEach((testParam) => {
            it(`Should merge ${testParam} subtrees`, async () => {
                const r = await deploy(
                    'AccQueueQuinary0',
                    SUB_DEPTH,
                    HASH_LENGTH,
                    ZERO,
                )
                const aq = r.aq
                const aqContract = r.aqContract
                await testMerge(aq, aqContract, testParam, MAIN_DEPTH)
            })
        })
      
    })

    describe('Binary AccQueue0 subtree insertions', () => {
        const SUB_DEPTH = 2
        const MAIN_DEPTH = 6
        const HASH_LENGTH = 2
        const ZERO = BigInt(0)

        it('Enqueued leaves and inserted subtrees should be in the right order', async () => {
            const r = await deploy(
                'AccQueueBinary0',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )
            const aq = r.aq
            const aqContract = r.aqContract
            await testEnqueueAndInsertSubTree(aq, aqContract)
        })

        const testParams = [1, 2, 3, 9]
        testParams.forEach((testParam) => {
            it(`Should insert ${testParam} subtrees`, async () => {
                const r = await deploy(
                    'AccQueueBinary0',
                    SUB_DEPTH,
                    HASH_LENGTH,
                    ZERO,
                )
                const aq = r.aq
                const aqContract = r.aqContract
                await testInsertSubTrees(aq, aqContract, testParam, MAIN_DEPTH)
            })
        })
    })

    describe('Quinary AccQueue0 subtree insertions', () => {
        const SUB_DEPTH = 2
        const MAIN_DEPTH = 6
        const HASH_LENGTH = 5
        const ZERO = BigInt(0)

        it('Enqueued leaves and inserted subtrees should be in the right order', async () => {
            const r = await deploy(
                'AccQueueQuinary0',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )
            const aq = r.aq
            const aqContract = r.aqContract
            await testEnqueueAndInsertSubTree(aq, aqContract)
        })

        const testParams = [1, 4, 9, 26]
        testParams.forEach((testParam) => {
            it(`Should insert ${testParam} subtrees`, async () => {
                const r = await deploy(
                    'AccQueueQuinary0',
                    SUB_DEPTH,
                    HASH_LENGTH,
                    ZERO,
                )
                const aq = r.aq
                const aqContract = r.aqContract
                await testInsertSubTrees(aq, aqContract, testParam, MAIN_DEPTH)
            })
        })
        
    })

    describe('Binary AccQueue0 progressive merges', () => {
        const SUB_DEPTH = 2
        const MAIN_DEPTH = 5
        const HASH_LENGTH = 2
        const ZERO = BigInt(0)
        const NUM_SUBTREES = 5
        let aq: AccQueue
        let aqContract

        before(async () => {
            const r = await deploy(
                'AccQueueBinary0',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )
            aq = r.aq
            aqContract = r.aqContract
        })

        it(`Should progressively merge ${NUM_SUBTREES} subtrees`, async () => {
            for (let i = 0; i < NUM_SUBTREES; i ++) {
                const leaf = BigInt(123)
                await (await aqContract.enqueue(leaf.toString(), enqueueGasLimit)).wait()
                aq.enqueue(leaf)

                aq.fill()
                await (await aqContract.fill(fillGasLimit)).wait()
            }

            aq.mergeSubRoots(0)
            const expectedSmallSRTroot = aq.smallSRTroot

            await expect(aqContract.getSmallSRTroot()).to.be.revertedWithCustomError(
                aqContract,
                "SubTreesNotMerged"
            )

            await (await aqContract.mergeSubRoots(2)).wait()
            await (await aqContract.mergeSubRoots(2)).wait()
            await (await aqContract.mergeSubRoots(1)).wait()

            const contractSmallSRTroot = await aqContract.getSmallSRTroot()
            expect(expectedSmallSRTroot.toString()).to.eq(contractSmallSRTroot.toString())

            aq.merge(MAIN_DEPTH)
            await (await aqContract.merge(MAIN_DEPTH)).wait()

            const expectedMainRoot = aq.mainRoots[MAIN_DEPTH]
            const contractMainRoot = await aqContract.getMainRoot(MAIN_DEPTH)

            expect(expectedMainRoot.toString()).to.eq(contractMainRoot.toString())
        })
    })

    describe('Quinary AccQueue0 progressive merges', () => {
        const SUB_DEPTH = 2
        const MAIN_DEPTH = 5
        const HASH_LENGTH = 5
        const ZERO = BigInt(0)
        const NUM_SUBTREES = 6
        let aq: AccQueue
        let aqContract
        before(async () => {
            const r = await deploy(
                'AccQueueQuinary0',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )
            aq = r.aq
            aqContract = r.aqContract
        })

        it(`Should progressively merge ${NUM_SUBTREES} subtrees`, async () => {
            for (let i = 0; i < NUM_SUBTREES; i ++) {
                const leaf = BigInt(123)
                await (await aqContract.enqueue(leaf.toString(), enqueueGasLimit)).wait()
                aq.enqueue(leaf)

                aq.fill()
                await (await aqContract.fill(fillGasLimit)).wait()
            }

            aq.mergeSubRoots(0)
            const expectedSmallSRTroot = aq.smallSRTroot
            
            await expect(aqContract.getSmallSRTroot()).to.be.revertedWithCustomError(
                aqContract,
                "SubTreesNotMerged"
            )
            
            await (await aqContract.mergeSubRoots(2)).wait()
            await (await aqContract.mergeSubRoots(2)).wait()
            await (await aqContract.mergeSubRoots(2)).wait()

            const contractSmallSRTroot = await aqContract.getSmallSRTroot()
            expect(expectedSmallSRTroot.toString()).to.eq(contractSmallSRTroot.toString())

            aq.merge(MAIN_DEPTH)
            await (await aqContract.merge(MAIN_DEPTH)).wait()

            const expectedMainRoot = aq.mainRoots[MAIN_DEPTH]
            const contractMainRoot = await aqContract.getMainRoot(MAIN_DEPTH)

            expect(expectedMainRoot.toString()).to.eq(contractMainRoot.toString())
        })
    })
 
    describe('Conditions that cause merge() to revert', () => {
        const SUB_DEPTH = 2
        const HASH_LENGTH = 2
        const ZERO = BigInt(0)
        const NUM_SUBTREES = 1
        let aqContract

        before(async () => {
            const r = await deploy(
                'AccQueueBinary0',
                SUB_DEPTH,
                HASH_LENGTH,
                ZERO,
            )
            aqContract = r.aqContract
        })

        it('mergeSubRoots() should fail on an empty AccQueue', async () => {
            await expect(aqContract.mergeSubRoots(0, { gasLimit: 1000000 })).to.be.revertedWithCustomError(
                aqContract,
                "NothingToMerge"
            )

        })

        it('merge() should revert on an empty AccQueue', async () => {
            await expect(aqContract.merge(1, { gasLimit: 1000000 })).to.be.revertedWithCustomError(
                aqContract,
                "SubTreesNotMerged"
            )
        })

        it(`merge() should revert if there are unmerged subtrees`, async () => {

            for (let i = 0; i < NUM_SUBTREES; i ++) {
                await (await (aqContract.fill(fillGasLimit))).wait()
            }

            await expect(aqContract.merge(1)).to.be.revertedWithCustomError(
                aqContract,
                "SubTreesNotMerged"
            )
        })

        it(`merge() should revert if the desired depth is invalid`, async () => {

            await (await (aqContract.mergeSubRoots(0, { gasLimit: 1000000 }))).wait()

            await expect(aqContract.merge(0, { gasLimit: 1000000 })).to.be.revertedWithCustomError(
                aqContract,
                "DepthCannotBeZero"
            )
        })
    })
})
