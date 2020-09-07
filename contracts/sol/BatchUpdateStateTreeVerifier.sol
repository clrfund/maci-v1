// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

// 2019 OKIMS

pragma solidity ^0.5.0;

library Pairing {

    uint256 constant PRIME_Q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    struct G1Point {
        uint256 X;
        uint256 Y;
    }

    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint256[2] X;
        uint256[2] Y;
    }

    /*
     * @return The negation of p, i.e. p.plus(p.negate()) should be zero. 
     */
    function negate(G1Point memory p) internal pure returns (G1Point memory) {

        // The prime q in the base field F_q for G1
        if (p.X == 0 && p.Y == 0) {
            return G1Point(0, 0);
        } else {
            return G1Point(p.X, PRIME_Q - (p.Y % PRIME_Q));
        }
    }

    /*
     * @return The sum of two points of G1
     */
    function plus(
        G1Point memory p1,
        G1Point memory p2
    ) internal view returns (G1Point memory r) {

        uint256[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas, 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }

        require(success,"pairing-add-failed");
    }

    /*
     * @return The product of a point on G1 and a scalar, i.e.
     *         p == p.scalar_mul(1) and p.plus(p) == p.scalar_mul(2) for all
     *         points p.
     */
    function scalar_mul(G1Point memory p, uint256 s) internal view returns (G1Point memory r) {

        uint256[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas, 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success,"pairing-mul-failed");
    }

    /* @return The result of computing the pairing check
     *         e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
     *         For example,
     *         pairing([P1(), P1().negate()], [P2(), P2()]) should return true.
     */
    function pairing(
        G1Point memory a1,
        G2Point memory a2,
        G1Point memory b1,
        G2Point memory b2,
        G1Point memory c1,
        G2Point memory c2,
        G1Point memory d1,
        G2Point memory d2
    ) internal view returns (bool) {

        G1Point[4] memory p1 = [a1, b1, c1, d1];
        G2Point[4] memory p2 = [a2, b2, c2, d2];

        uint256 inputSize = 24;
        uint256[] memory input = new uint256[](inputSize);

        for (uint256 i = 0; i < 4; i++) {
            uint256 j = i * 6;
            input[j + 0] = p1[i].X;
            input[j + 1] = p1[i].Y;
            input[j + 2] = p2[i].X[0];
            input[j + 3] = p2[i].X[1];
            input[j + 4] = p2[i].Y[0];
            input[j + 5] = p2[i].Y[1];
        }

        uint256[1] memory out;
        bool success;

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas, 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }

        require(success,"pairing-opcode-failed");

        return out[0] != 0;
    }
}

contract BatchUpdateStateTreeVerifier {

    using Pairing for *;

    uint256 constant SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    uint256 constant PRIME_Q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    struct VerifyingKey {
        Pairing.G1Point alpha1;
        Pairing.G2Point beta2;
        Pairing.G2Point gamma2;
        Pairing.G2Point delta2;
        Pairing.G1Point[33] IC;
    }

    struct Proof {
        Pairing.G1Point A;
        Pairing.G2Point B;
        Pairing.G1Point C;
    }

    function verifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alpha1 = Pairing.G1Point(uint256(17133464088378687077088482264559260263983148865902404429977722280234511381298),uint256(13785688003513399409060194302143834374230384335029440050591372860926238142193));
        vk.beta2 = Pairing.G2Point([uint256(2840484440438769946495296280122215248778207395743243463056927142949692947992),uint256(17893260557868532777170757032257510671949880325894417303584532948507645228680)], [uint256(9836656668462968607190121393344221140197393090610503892255635775752104592205),uint256(12486599733786832744178685220875326743182566177554272371383407722520744824831)]);
        vk.gamma2 = Pairing.G2Point([uint256(11559732032986387107991004021392285783925812861821192530917403151452391805634),uint256(10857046999023057135944570762232829481370756359578518086990519993285655852781)], [uint256(4082367875863433681332203403145435568316851327593401208105741076214120093531),uint256(8495653923123431417604973247489272438418190587263600148770280649306958101930)]);
        vk.delta2 = Pairing.G2Point([uint256(11559732032986387107991004021392285783925812861821192530917403151452391805634),uint256(10857046999023057135944570762232829481370756359578518086990519993285655852781)], [uint256(4082367875863433681332203403145435568316851327593401208105741076214120093531),uint256(8495653923123431417604973247489272438418190587263600148770280649306958101930)]);
        vk.IC[0] = Pairing.G1Point(uint256(15058030462542088998885247147318305999509945832035354408977781246005733258026),uint256(11120540050735792611067534731877662255716554320903989331537025920052750571002));
        vk.IC[1] = Pairing.G1Point(uint256(21562997240297330944154659017186416779581969276679226087617390922720171109245),uint256(11152295967174015164904392464378837206104171733240500273628654092902350118720));
        vk.IC[2] = Pairing.G1Point(uint256(5781958907224108103702145436455010661147201664102129838744012064459162068271),uint256(1993294442087263879870588298088413945274939405694359264353851608190394055547));
        vk.IC[3] = Pairing.G1Point(uint256(6263675676628854412795767751188900346237787285294460293124174534776291161086),uint256(10019940673981011339454602554177465051054295994291274885820057431850424053904));
        vk.IC[4] = Pairing.G1Point(uint256(12394583654108013052005544610405644000422166900094994553690614761351764534296),uint256(16786481209870848656980303830526873080045473987907371452511601205916165148025));
        vk.IC[5] = Pairing.G1Point(uint256(21883956105604806430258395878840077241350480048666422055459011937580025983980),uint256(4676805860165207223107246635327137762323458623125914098937420681486457488072));
        vk.IC[6] = Pairing.G1Point(uint256(5976851526616981359106216892321684928431641223548811448136972545038851083747),uint256(6780396160399862926983100962043166317295937525752062550796541195805708120019));
        vk.IC[7] = Pairing.G1Point(uint256(10107314581448848938871784324549357134349886990344594928822878259366571165698),uint256(19048800952147350436720717221400932892136329707939451576185784945953882033943));
        vk.IC[8] = Pairing.G1Point(uint256(685629004242509893637620719855521889095004480794773224584196248326400434849),uint256(17381747186344953907468401709968985770550345630398909876131172628909842946245));
        vk.IC[9] = Pairing.G1Point(uint256(425878678850744391781129943268397562939093224508743925421877583052474182720),uint256(963235874153751393788015552086775291044453691136936722053625582518508661204));
        vk.IC[10] = Pairing.G1Point(uint256(14793963451855301472735136173461424778781223816756929976358113297660537990324),uint256(12604935421207115032175108959967847126061379921738560950568689731622469486219));
        vk.IC[11] = Pairing.G1Point(uint256(8600842529132902443493659142577838814548684399017111969917542936517550744274),uint256(4559854388305182137051562022017002400613407448836880589360638835501748904194));
        vk.IC[12] = Pairing.G1Point(uint256(21346539551475338849918756695043243489402257814836216453262456056660465600508),uint256(3133927489636509386512429106476220380872455637374077604070054639862215415807));
        vk.IC[13] = Pairing.G1Point(uint256(1683932807456428552954704429543657908769513020250339602216552946765502529654),uint256(14471610528119352818098883796191190126884086262322601879687551802092206098706));
        vk.IC[14] = Pairing.G1Point(uint256(2527505215185830880602440556221191975632767174597046454180398631236332232453),uint256(14186796055287684998623980147646905385168568987587098969663563120735022025144));
        vk.IC[15] = Pairing.G1Point(uint256(6381107735693745831543611539665669068707196557878766469920770940417458041283),uint256(3681856419945575635749107837775297141417696384673768738185880672867702131690));
        vk.IC[16] = Pairing.G1Point(uint256(3344946339158385249786781284221141121230067383035981969122041900665376285082),uint256(15762665191130960610390091926618998632519927818715460771635756974968767808049));
        vk.IC[17] = Pairing.G1Point(uint256(13767798219390729227121234912240789114150604698550659329765190820014747203885),uint256(18979320504120540804741433767678776447377730233038994226542595298260021111921));
        vk.IC[18] = Pairing.G1Point(uint256(2162731950517318408944126785566973217655629049799848950810484406788539933127),uint256(4070375054781666075219105002094082718952628846415710194989495847915511435212));
        vk.IC[19] = Pairing.G1Point(uint256(9426050406433938963824286505738563430238046258184577725201639040428258257141),uint256(3899371040344568096727396470653808120898492803142076752388240010770448982663));
        vk.IC[20] = Pairing.G1Point(uint256(988802914537799826978973620208459366685327256129654383666883109184934189407),uint256(14600353110035133244080117647697215377502798548468811978355939722087363301078));
        vk.IC[21] = Pairing.G1Point(uint256(3204207366859878725441928921249496991559815744084167925567960415066129719275),uint256(4030745549576964000765781826358131025719107321228150299690056668882030501476));
        vk.IC[22] = Pairing.G1Point(uint256(19850139216994276502582733498469910264535738370118008828341060700974842014964),uint256(8933049036344253561051396410383245878261069567636438409675398309205387336585));
        vk.IC[23] = Pairing.G1Point(uint256(6894250771926910562871740856211694376671742241576222985816321139388358046974),uint256(6921450774414458690223436429616305823634000344629596102691367954786261532837));
        vk.IC[24] = Pairing.G1Point(uint256(7590333541615283062473373720148425453716466047537794161830084178427059146218),uint256(13004819807017211433943716983330647731303257202816437238605151721002224877202));
        vk.IC[25] = Pairing.G1Point(uint256(17704112647806792212421075678273228005806461503483175338674631136268738320750),uint256(4548586010724725509287069194439682551873643733952584553162985695777896457561));
        vk.IC[26] = Pairing.G1Point(uint256(17214771521258161740167450223616394783701116815199440654394747586451515641699),uint256(10750051081129892382664596389567866650389152711754095920920888138285282471942));
        vk.IC[27] = Pairing.G1Point(uint256(16700953062515908555059096816322438197276623245409051104935655810823480462057),uint256(18452069378115114846125512674901830492466031234491117444830804227431467440627));
        vk.IC[28] = Pairing.G1Point(uint256(3160276614978557285016073363117574324978407113371760120498644025347645792830),uint256(8645475424842803730509647686378151810210192575898125737638941452715830590296));
        vk.IC[29] = Pairing.G1Point(uint256(21695662959051234606743166074998589152011450216784315470465449694599540664830),uint256(14739869407912339790853957323191640114323977175930277768732443556279127023307));
        vk.IC[30] = Pairing.G1Point(uint256(2591088908884472120636001209288285824972568152370187225854800907094192134278),uint256(13974134307243337931394220520948227152512644951981068097785376120759821163375));
        vk.IC[31] = Pairing.G1Point(uint256(10436385116655698734151004408303480353026496782462889622582524347679429810977),uint256(12580038710525251474064871219885598775396794273469027076932192864404605764145));
        vk.IC[32] = Pairing.G1Point(uint256(10310798817069109092573796441268736959861963495895064752263250107486340772567),uint256(1222927431045354353774463157405252663241610021644857910605808528991451610914));

    }
    
    /*
     * @returns Whether the proof is valid given the hardcoded verifying key
     *          above and the public inputs
     */
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[32] memory input
    ) public view returns (bool) {

        Proof memory proof;
        proof.A = Pairing.G1Point(a[0], a[1]);
        proof.B = Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
        proof.C = Pairing.G1Point(c[0], c[1]);

        VerifyingKey memory vk = verifyingKey();

        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);

        // Make sure that proof.A, B, and C are each less than the prime q
        require(proof.A.X < PRIME_Q, "verifier-aX-gte-prime-q");
        require(proof.A.Y < PRIME_Q, "verifier-aY-gte-prime-q");

        require(proof.B.X[0] < PRIME_Q, "verifier-bX0-gte-prime-q");
        require(proof.B.Y[0] < PRIME_Q, "verifier-bY0-gte-prime-q");

        require(proof.B.X[1] < PRIME_Q, "verifier-bX1-gte-prime-q");
        require(proof.B.Y[1] < PRIME_Q, "verifier-bY1-gte-prime-q");

        require(proof.C.X < PRIME_Q, "verifier-cX-gte-prime-q");
        require(proof.C.Y < PRIME_Q, "verifier-cY-gte-prime-q");

        // Make sure that every input is less than the snark scalar field
        for (uint256 i = 0; i < input.length; i++) {
            require(input[i] < SNARK_SCALAR_FIELD,"verifier-gte-snark-scalar-field");
            vk_x = Pairing.plus(vk_x, Pairing.scalar_mul(vk.IC[i + 1], input[i]));
        }

        vk_x = Pairing.plus(vk_x, vk.IC[0]);

        return Pairing.pairing(
            Pairing.negate(proof.A),
            proof.B,
            vk.alpha1,
            vk.beta2,
            vk_x,
            vk.gamma2,
            proof.C,
            vk.delta2
        );
    }
}
