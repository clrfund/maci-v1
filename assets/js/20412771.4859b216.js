"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[3162],{8224:(e,i,n)=>{n.r(i),n.d(i,{assets:()=>c,contentTitle:()=>r,default:()=>h,frontMatter:()=>a,metadata:()=>o,toc:()=>d});var t=n(5893),s=n(1151);const a={title:"MACI Security Audits",description:"In the summer of 2022, MACI v1 was audited by HashCloak. The audit covered both the zk-SNARK circuits and the Solidity smart contracts.",sidebar_label:"Security Assessments",sidebar_position:11},r="Security Audits",o={id:"audit",title:"MACI Security Audits",description:"In the summer of 2022, MACI v1 was audited by HashCloak. The audit covered both the zk-SNARK circuits and the Solidity smart contracts.",source:"@site/versioned_docs/version-v1.x/audit.md",sourceDirName:".",slug:"/audit",permalink:"/docs/audit",draft:!1,unlisted:!1,editUrl:"https://github.com/privacy-scaling-explorations/maci/edit/dev/website/versioned_docs/version-v1.x/audit.md",tags:[],version:"v1.x",sidebarPosition:11,frontMatter:{title:"MACI Security Audits",description:"In the summer of 2022, MACI v1 was audited by HashCloak. The audit covered both the zk-SNARK circuits and the Solidity smart contracts.",sidebar_label:"Security Assessments",sidebar_position:11},sidebar:"version-1.x/mySidebar",previous:{title:"Integrating",permalink:"/docs/integrating"},next:{title:"CI",permalink:"/docs/ci-pipeline"}},c={},d=[{value:"Links",id:"links",level:2},{value:"HashCloak audit 2022",id:"hashcloak-audit-2022",level:2},{value:"Data is not fully verified during a state update",id:"data-is-not-fully-verified-during-a-state-update",level:2},{value:"Token for top-up is a free resource",id:"token-for-top-up-is-a-free-resource",level:2},{value:"Integer overflow problem and improper bit length restriction",id:"integer-overflow-problem-and-improper-bit-length-restriction",level:2},{value:"MessageQueue in PollFactory is uninitialized",id:"messagequeue-in-pollfactory-is-uninitialized",level:2},{value:"Additional issues and improvements",id:"additional-issues-and-improvements",level:2},{value:"Veridise disclosure 2023",id:"veridise-disclosure-2023",level:2},{value:"Issue 1",id:"issue-1",level:3},{value:"Issue 2",id:"issue-2",level:3},{value:"Issue 3",id:"issue-3",level:3}];function l(e){const i={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,s.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(i.h1,{id:"security-audits",children:"Security Audits"}),"\n",(0,t.jsx)(i.h2,{id:"links",children:"Links"}),"\n",(0,t.jsxs)(i.ul,{children:["\n",(0,t.jsxs)(i.li,{children:["Audit by HashCloak 2022/09 ",(0,t.jsx)(i.a,{target:"_blank",href:n(1058).Z+"",children:"report"})]}),"\n",(0,t.jsxs)(i.li,{children:["Audit by HashCloak 2021/09 ",(0,t.jsx)(i.a,{target:"_blank",href:n(8015).Z+"",children:"report"})]}),"\n"]}),"\n",(0,t.jsx)(i.h2,{id:"hashcloak-audit-2022",children:"HashCloak audit 2022"}),"\n",(0,t.jsx)(i.p,{children:"In the summer of 2022, MACI v1 was audited by HashCloak. The audit covered both the zk-SNARK circuits and the Solidity smart contracts."}),"\n",(0,t.jsx)(i.p,{children:"This audit revealed a number of high severity issues which have been remediated by the MACI development team. We will be looking at those in details in the following sections."}),"\n",(0,t.jsx)(i.h2,{id:"data-is-not-fully-verified-during-a-state-update",children:"Data is not fully verified during a state update"}),"\n",(0,t.jsx)(i.p,{children:"This issue could have allowed a malicious coordinator to change the MACI state arbitrarily, for instance by tampering with the voice credits and the voting public key of any user."}),"\n",(0,t.jsxs)(i.p,{children:["In more details, the ",(0,t.jsx)(i.code,{children:"processMessages.circom"})," circuit, did not fully verify that after a state update, the new state was the result of executing an arbitrary number of user messages on the previous state. ",(0,t.jsx)(i.code,{children:"topupStateLeaves"})," and ",(0,t.jsx)(i.code,{children:"topupStateLeavesPathElements"})," were never verified against the current state, and ",(0,t.jsx)(i.code,{children:"topupStateIndexes"})," and ",(0,t.jsx)(i.code,{children:"topupAmounts"})," were not verified against the message root."]}),"\n",(0,t.jsxs)(i.p,{children:["This was rectified with commit ",(0,t.jsx)(i.a,{href:"https://github.com/privacy-scaling-explorations/maci/pull/522/commits/6df6a4054da926b07f35c5befab4f1f8af33dcc6",children:"6df6a4054da926b07f35c5befab4f1f8af33dcc6"})]}),"\n",(0,t.jsx)(i.h2,{id:"token-for-top-up-is-a-free-resource",children:"Token for top-up is a free resource"}),"\n",(0,t.jsxs)(i.p,{children:["The provided ",(0,t.jsx)(i.code,{children:"TopupCredit.sol"})," contract implemented unprotected ",(0,t.jsx)(i.code,{children:"airdrop"})," and ",(0,t.jsx)(i.code,{children:"airdropTo"})," functions, which could have allowed anyone to receive unlimited voice credits. While this contract was provided as a template, the issue has been rectified by adding the ",(0,t.jsx)(i.code,{children:"onlyOwner"})," modifier to these two functions."]}),"\n",(0,t.jsx)(i.pre,{children:(0,t.jsx)(i.code,{className:"language-javascript",children:'function airdropTo(address account, uint256 amount) public onlyOwner {\n    require(amount < MAXIMUM_AIRDROP_AMOUNT);\n    _mint(account, amount);\n}\n\nfunction airdrop(uint256 amount) public onlyOwner {\n    require(amount < MAXIMUM_AIRDROP_AMOUNT, "amount exceed maximum limit");\n    _mint(msg.sender, amount);\n}\n'})}),"\n",(0,t.jsx)(i.h2,{id:"integer-overflow-problem-and-improper-bit-length-restriction",children:"Integer overflow problem and improper bit length restriction"}),"\n",(0,t.jsxs)(i.p,{children:["This issue within the ",(0,t.jsx)(i.code,{children:"float.circom"})," circuit could have resulted in an overflow on the ",(0,t.jsx)(i.code,{children:"IntegerDivision"})," template. This stemmed from the lack of validation of input size, as well as not preventing a division by zero. Furthemore, it was pointed out that using assert in circuits did not contribute to constraints verification, and could have been bypassed by a malicious coordinator."]}),"\n",(0,t.jsxs)(i.p,{children:["The issue was rectified with commit ",(0,t.jsx)(i.a,{href:"https://github.com/privacy-scaling-explorations/maci/pull/523/commits/efd4617724e956d2566062c6fe882e1d45cba7c4",children:"efd4617724e956d2566062c6fe882e1d45cba7c4"})]}),"\n",(0,t.jsx)(i.h2,{id:"messagequeue-in-pollfactory-is-uninitialized",children:"MessageQueue in PollFactory is uninitialized"}),"\n",(0,t.jsx)(i.p,{children:"MACI uses a message queue (a quinary merkle tree) to store all the messages to be processed for a single poll. When deploying a new poll, a corresponding message queue contract is deployed as well, however this was never initialized with a zero value."}),"\n",(0,t.jsx)(i.p,{children:"Should the queue never be initialized with the zero value, a malicious user could submit a message to initialize the queue with a value they know how to decrypt, which however would take a very long time to generate a proof for. This could result in a denial of service attack against the coordinator."}),"\n",(0,t.jsxs)(i.p,{children:["The code was fixed by enqueuing a message containing the zero value ",(0,t.jsx)(i.code,{children:"NOTHING_UP_MY_SLEEVE"})," which is the result of:"]}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.code,{children:'keccak256("Maci") % p'})}),"\n",(0,t.jsxs)(i.p,{children:["Translated into code, an ",(0,t.jsx)(i.code,{children:"init"})," function was included in the Poll contract, with the following enqueuing of the placeholder leaf:"]}),"\n",(0,t.jsx)(i.pre,{children:(0,t.jsx)(i.code,{className:"language-javascript",children:"// init messageAq here by inserting placeholderLeaf\nuint256[2] memory dat;\ndat[0] = NOTHING_UP_MY_SLEEVE;\ndat[1] = 0;\n(Message memory _message, PubKey memory _padKey, uint256 placeholderLeaf) = padAndHashMessage(dat, 1);\nextContracts.messageAq.enqueue(placeholderLeaf);\n"})}),"\n",(0,t.jsx)(i.h2,{id:"additional-issues-and-improvements",children:"Additional issues and improvements"}),"\n",(0,t.jsx)(i.p,{children:"The rest of the issues were either low risk, informational or general optimizations."}),"\n",(0,t.jsxs)(i.p,{children:["As an example, there were certain functions which did not enforce the checks-effets-interaction pattern, which could potentially have led to reentrancy attacks. While most of these have been fully remediated, the ",(0,t.jsx)(i.code,{children:"deployPoll"})," function within MACI is not currently enforcing the pattern when deploying a new poll contract using the ",(0,t.jsx)(i.code,{children:"PollFactory"})," factory contract."]}),"\n",(0,t.jsx)(i.pre,{children:(0,t.jsx)(i.code,{className:"language-javascript",children:"function deployPoll(\n    uint256 _duration,\n    MaxValues memory _maxValues,\n    TreeDepths memory _treeDepths,\n    PubKey memory _coordinatorPubKey\n) public afterInit {\n    uint256 pollId = nextPollId;\n\n   [..snip]\n\n    Poll p = pollFactory.deploy(\n        _duration,\n        _maxValues,\n        _treeDepths,\n        batchSizes,\n        _coordinatorPubKey,\n        vkRegistry,\n        this,\n        topupCredit,\n        owner()\n    );\n\n    polls[pollId] = p;\n\n    emit DeployPoll(pollId, address(p), _coordinatorPubKey);\n}\n"})}),"\n",(0,t.jsxs)(i.p,{children:["As seen above, an external call is made, before updating the state with the new poll. The issue is tracked ",(0,t.jsx)(i.a,{href:"https://github.com/privacy-scaling-explorations/maci/pull/522#discussion_r981863147",children:"here"})," and only left open as the code does not enforce best practices, however it does not pose any immediate risk."]}),"\n",(0,t.jsxs)(i.p,{children:["The rest of the issues were successfully fixed and reflected in the v1.1.1. For the full report, please refer to the ",(0,t.jsx)(i.code,{children:"audit"})," folder inside the root of the repository."]}),"\n",(0,t.jsx)(i.h2,{id:"veridise-disclosure-2023",children:"Veridise disclosure 2023"}),"\n",(0,t.jsxs)(i.p,{children:["In March 2023, Veridise responsibly disclosed a number of issues to the MACI team, which were identified using their new ",(0,t.jsx)(i.a,{href:"https://twitter.com/VeridiseInc/status/1630806464695791616?s=20",children:"tool"})," for catching ZK circuit bugs."]}),"\n",(0,t.jsx)(i.p,{children:"Out of five issues disclosed, only three were relevant and have been since fixed by the MACI team. The other two issues were disregarded as they were present in older version of code which is not in use anymore."}),"\n",(0,t.jsx)(i.p,{children:"We would like to thank you the Veridise team for their effort in keeping open source projects safe."}),"\n",(0,t.jsxs)(i.blockquote,{children:["\n",(0,t.jsx)(i.p,{children:"Please note that at this time the fixed code is only present in the dev branch. This will be merged to the main branch in the next minor update."}),"\n"]}),"\n",(0,t.jsx)(i.h3,{id:"issue-1",children:"Issue 1"}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.strong,{children:"Description"})}),"\n",(0,t.jsxs)(i.p,{children:["In the template ",(0,t.jsx)(i.code,{children:"QuinSelector"}),", if you want to confirm the input signal index is a valid integer less than 2**3, you should add Num2bits(3) to check it."]}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.strong,{children:"Code Location"})}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.a,{href:"https://github.com/privacy-scaling-explorations/maci/blob/78609349aecd94186216ac8743d61b1cb81a097f/circuits/circom/trees/incrementalQuinTree.circom#L30",children:(0,t.jsx)(i.code,{children:"incrementalQuinTree.circom"})})}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.strong,{children:"Fix"})}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.a,{href:"https://github.com/chaosma/maci/blob/60727d4d10406edda32ad28e53d399d41d45ed88/circuits/circom/trees/incrementalQuinTree.circom#L37",children:"Code location"})}),"\n",(0,t.jsx)(i.pre,{children:(0,t.jsx)(i.code,{className:"language-javascript",children:"// Ensure that index < choices\ncomponent lessThan = SafeLessThan(3);\n"})}),"\n",(0,t.jsxs)(i.p,{children:["This was fixed by adding a new Template, ",(0,t.jsx)(i.code,{children:"SafeLesThan"})," which uses ",(0,t.jsx)(i.code,{children:"Num2Bits"})," as further check on the signals:"]}),"\n",(0,t.jsx)(i.pre,{children:(0,t.jsx)(i.code,{className:"language-javascript",children:"// the implicit assumption of LessThan is both inputs are at most n bits\n// so we need add range check for both inputs\ntemplate SafeLessThan(n) {\n    assert(n <= 252);\n    signal input in[2];\n    signal output out;\n\n    component n2b1 = Num2Bits(n);\n    n2b1.in  <== in[0];\n    component n2b2 = Num2Bits(n);\n    n2b2.in  <== in[1];\n\n    component n2b = Num2Bits(n+1);\n\n    n2b.in <== in[0]+ (1<<n) - in[1];\n\n    out <== 1-n2b.out[n];\n}\n"})}),"\n",(0,t.jsx)(i.h3,{id:"issue-2",children:"Issue 2"}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.strong,{children:"Description"})}),"\n",(0,t.jsx)(i.p,{children:"This issue is the same issue number 1, this time for the input signal index."}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.strong,{children:"Code Location"})}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.a,{href:"https://github.com/privacy-scaling-explorations/maci/blob/78609349aecd94186216ac8743d61b1cb81a097f/circuits/circom/trees/incrementalQuinTree.circom#L64",children:(0,t.jsx)(i.code,{children:"incrementalQuinTree.circom"})})}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.strong,{children:"Fix"})}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.a,{href:"https://github.com/privacy-scaling-explorations/maci/pull/646/files#diff-f3ad1f61e9b95b88929664b67c873325fdf70cb8569c2a96da4b0e9f02710391",children:"PR with fix"})}),"\n",(0,t.jsxs)(i.p,{children:["As with issue number 1, a new template ",(0,t.jsx)(i.code,{children:"SafeGreaterThan"})," was added:"]}),"\n",(0,t.jsx)(i.pre,{children:(0,t.jsx)(i.code,{className:"language-javascript",children:"// N is the number of bits the input  have.\n// The MSF is the sign bit.\ntemplate SafeGreaterThan(n) {\n    signal input in[2];\n    signal output out;\n\n    component lt = SafeLessThan(n);\n\n    lt.in[0] <== in[1];\n    lt.in[1] <== in[0];\n    lt.out ==> out;\n}\n"})}),"\n",(0,t.jsxs)(i.p,{children:["And then used it to constrain the ",(0,t.jsxs)(i.a,{href:"https://github.com/chaosma/maci/blob/2d7a3a0efd33dfc3a5f4d3f95bec3adda7abb963/circuits/circom/trees/incrementalQuinTree.circom#L115-L117",children:[(0,t.jsx)(i.code,{children:"index"})," input signal"]}),":"]}),"\n",(0,t.jsx)(i.pre,{children:(0,t.jsx)(i.code,{className:"language-javascript",children:"greaterThan[i] = SafeGreaterThan(3);\ngreaterThan[i].in[0] <== i;\ngreaterThan[i].in[1] <== index;\n"})}),"\n",(0,t.jsx)(i.h3,{id:"issue-3",children:"Issue 3"}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.strong,{children:"Description"})}),"\n",(0,t.jsxs)(i.p,{children:["In the template ",(0,t.jsx)(i.code,{children:"QuinGeneratePathIndices"}),", the constrains of the ",(0,t.jsx)(i.code,{children:"signal n[levels + 1]"})," don't perform well for division and modulo counting."]}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.strong,{children:"Code Location"})}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.a,{href:"https://github.com/privacy-scaling-explorations/maci/blob/7c1b3743ea753786011289a356eaa45ba72f9ca1/circuits/circom/trees/incrementalQuinTree.circom#L228-L242",children:(0,t.jsx)(i.code,{children:"incrementalQuinTree.circom"})})}),"\n",(0,t.jsx)(i.p,{children:(0,t.jsx)(i.strong,{children:"Fix"})}),"\n",(0,t.jsxs)(i.p,{children:["The ",(0,t.jsx)(i.a,{href:"https://github.com/chaosma/maci/blob/2d7a3a0efd33dfc3a5f4d3f95bec3adda7abb963/circuits/circom/trees/incrementalQuinTree.circom#L285-L290",children:"updated code"})," uses the ",(0,t.jsx)(i.code,{children:"SafeLessThen"})," template, as shown below:"]}),"\n",(0,t.jsx)(i.pre,{children:(0,t.jsx)(i.code,{className:"language-javascript",children:"for (var i = 0; i < levels; i ++) {\n    // Check that each output element is less than the base\n    leq[i] = SafeLessThan(3);\n    leq[i].in[0] <== out[i];\n    leq[i].in[1] <== BASE;\n    leq[i].out === 1;\n\n    // Re-compute the total sum\n    sum.nums[i] <== out[i] * (BASE ** i);\n}\n"})})]})}function h(e={}){const{wrapper:i}={...(0,s.a)(),...e.components};return i?(0,t.jsx)(i,{...e,children:(0,t.jsx)(l,{...e})}):l(e)}},8015:(e,i,n)=>{n.d(i,{Z:()=>t});const t=n.p+"assets/files/20210922_Hashcloak_audit_report-dde10f7a56efb98ef4ca985305e76fd4.pdf"},1058:(e,i,n)=>{n.d(i,{Z:()=>t});const t=n.p+"assets/files/202220930_Hashcloak_audit_report-14721b7c4e340998f118116825f611e0.pdf"},1151:(e,i,n)=>{n.d(i,{Z:()=>o,a:()=>r});var t=n(7294);const s={},a=t.createContext(s);function r(e){const i=t.useContext(a);return t.useMemo((function(){return"function"==typeof e?e(i):{...i,...e}}),[i,e])}function o(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:r(e.components),t.createElement(a.Provider,{value:i},e.children)}}}]);