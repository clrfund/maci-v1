// SPDX-License-Identifier: MIT
pragma solidity ^0.7.2;

abstract contract MerkleZeros {
    uint256[33] internal zeros;

    // Quinary tree zeros (Keccak hash of 'Maci')
    constructor() {
        zeros[0] = uint256(8370432830353022751713833565135785980866757267633941821328460903436894336785);
        zeros[1] = uint256(12915444503621073454579416579430905206970714557680052030066757042249102605307);
        zeros[2] = uint256(15825388848727206932541662858173052318786639683743459477657913288690190505308);
        zeros[3] = uint256(20672917177817295069558894035958266756825295443848082659014905185716743537191);
        zeros[4] = uint256(448586013948167251740855715259393055429962470693972912240018559200278204556);
        zeros[5] = uint256(3228865992178886480410396198366133115832717015233640381802715479176981303177);
        zeros[6] = uint256(19116532419590876304532847271428641103751206695152259493043279205958851263600);
        zeros[7] = uint256(13531983203936271379763604150672239370281863210813769735936250692178889682484);
        zeros[8] = uint256(8276490051100115441938424474671329955897359239518198952109759468777824929104);
        zeros[9] = uint256(1234816188709792521426066175633785051600533236493067959807265450339481920006);
        zeros[10] = uint256(14253963034950198848796956783804665963745244419038717333683296599064556174281);
        zeros[11] = uint256(6367560368479067766970398112009211893636892126125767203198799843543931913172);
        zeros[12] = uint256(9086778412328290069463938062555298073857321633960448227011862356090607842391);
        zeros[13] = uint256(1440983698234119608650157588008070947531139377294971527360643096251396484622);
        zeros[14] = uint256(3957599085599383799297196095384587366602816424699353871878382158004571037876);
        zeros[15] = uint256(2874250189355749385170216620368454832544508482778847425177457138604069991955);
        zeros[16] = uint256(21009179226085449764156117702096359546848859855915028677582017987249294772778);
        zeros[17] = uint256(11639371146919469643603772238908032714588430905217730187804009793768292270213);
        zeros[18] = uint256(6279313411277883478350325643881386249374023631847602720184182017599127173896);
        zeros[19] = uint256(21059196126634383551994255775761712285020874549906884292741523421591865338509);
        zeros[20] = uint256(9444544622817172574621750245792527383369133221167610044960147559319164808325);
        zeros[21] = uint256(5374570219497355452080912323548395721574511162814862844226178635172695078543);
        zeros[22] = uint256(4155904241440251764630449308160227499466701168124519106689866311729092343061);
        zeros[23] = uint256(15881609944326576145786405158479503217901875433072026818450276983706463215155);
        zeros[24] = uint256(20831546672064137588434602157208687297579005252478070660473540633558666587287);
        zeros[25] = uint256(3209071488384365842993449718919243416332014108747571544339190291353564426179);
        zeros[26] = uint256(10030934989297780221224272248227257782450689603145083016739151821673604746295);
        zeros[27] = uint256(16504852316033851373501270056537918974469380446508638487151124538300880427080);
        zeros[28] = uint256(5226137093551352657015038416264755428944140743893702595442932837011856178457);
        zeros[29] = uint256(18779994066356991319291039019820482828679702085087990978933303018673869446075);
        zeros[30] = uint256(12037506572124351893114409509086276299115869080424687624451184925646292710978);
        zeros[31] = uint256(12049750997011422639258622747494178076018128204515149991024639355149614767606);
        zeros[32] = uint256(3171463916443906096008599541392648187002297410622977814790586531203175805057);
    }
}
