"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[6969],{3129:(s,e,n)=>{n.r(e),n.d(e,{assets:()=>r,contentTitle:()=>l,default:()=>m,frontMatter:()=>a,metadata:()=>c,toc:()=>h});var i=n(5893),t=n(1151);const a={title:"MACI Circuits",description:"Introduction to the core zk-SNARK circuits of MACI",sidebar_label:"Circuits",sidebar_position:7},l="Circuits",c={id:"circuits",title:"MACI Circuits",description:"Introduction to the core zk-SNARK circuits of MACI",source:"@site/versioned_docs/version-v1.x/circuits.md",sourceDirName:".",slug:"/circuits",permalink:"/docs/circuits",draft:!1,unlisted:!1,editUrl:"https://github.com/privacy-scaling-explorations/maci/edit/dev/website/versioned_docs/version-v1.x/circuits.md",tags:[],version:"v1.x",sidebarPosition:7,frontMatter:{title:"MACI Circuits",description:"Introduction to the core zk-SNARK circuits of MACI",sidebar_label:"Circuits",sidebar_position:7},sidebar:"version-1.x/mySidebar",previous:{title:"Smart Contracts",permalink:"/docs/contracts"},next:{title:"Trusted Setup",permalink:"/docs/trusted-setup"}},r={},h=[{value:"Message processing",id:"message-processing",level:3},{value:"Vote tallying",id:"vote-tallying",level:3},{value:"Subsisdy",id:"subsisdy",level:3},{value:"Compile circuits",id:"compile-circuits",level:2},{value:"Prerequisites",id:"prerequisites",level:3},{value:"Building MACI circuits",id:"building-maci-circuits",level:3},{value:"Generating zKeys",id:"generating-zkeys",level:3},{value:"Measure the circuit sizes",id:"measure-the-circuit-sizes",level:4},{value:"Download the <code>.ptau</code> file",id:"download-the-ptau-file",level:4},{value:"Generating and Validating ZK Proofs",id:"generating-and-validating-zk-proofs",level:3},{value:"Testing",id:"testing",level:2}];function d(s){const e={a:"a",annotation:"annotation",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",li:"li",math:"math",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",msup:"msup",ol:"ol",p:"p",pre:"pre",semantics:"semantics",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,t.a)(),...s.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(e.h1,{id:"circuits",children:"Circuits"}),"\n",(0,i.jsx)(e.p,{children:"MACI has three zk-SNARK circuits:"}),"\n",(0,i.jsxs)(e.ol,{children:["\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.code,{children:"ProcessMessages.circom"}),", which takes a batch of messages, and updates the\nstate and ballot trees according to the contents of said messages."]}),"\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.code,{children:"TallyVotes.circom"}),", which counts votes from users' ballots, batch by batch."]}),"\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.code,{children:"Subsidy.circom"}),", which implements ",(0,i.jsx)(e.a,{href:"https://hackmd.io/@chaosma/H1_9xmT2K",children:"pairwise subsidy"})]}),"\n"]}),"\n",(0,i.jsxs)(e.p,{children:["Each circuit is parameterised and it is important to set the right parameters\nto your use case. For example, if you want to support up to 3125 messages, the message tree depth parameter should be set to ",(0,i.jsx)(e.code,{children:"5"})," (as ",(0,i.jsxs)(e.span,{className:"katex",children:[(0,i.jsx)(e.span,{className:"katex-mathml",children:(0,i.jsx)(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:(0,i.jsxs)(e.semantics,{children:[(0,i.jsxs)(e.mrow,{children:[(0,i.jsxs)(e.msup,{children:[(0,i.jsx)(e.mn,{children:"5"}),(0,i.jsx)(e.mn,{children:"5"})]}),(0,i.jsx)(e.mo,{children:"="}),(0,i.jsx)(e.mn,{children:"3125"})]}),(0,i.jsx)(e.annotation,{encoding:"application/x-tex",children:"5^5 = 3125"})]})})}),(0,i.jsxs)(e.span,{className:"katex-html","aria-hidden":"true",children:[(0,i.jsxs)(e.span,{className:"base",children:[(0,i.jsx)(e.span,{className:"strut",style:{height:"0.8141em"}}),(0,i.jsxs)(e.span,{className:"mord",children:[(0,i.jsx)(e.span,{className:"mord",children:"5"}),(0,i.jsx)(e.span,{className:"msupsub",children:(0,i.jsx)(e.span,{className:"vlist-t",children:(0,i.jsx)(e.span,{className:"vlist-r",children:(0,i.jsx)(e.span,{className:"vlist",style:{height:"0.8141em"},children:(0,i.jsxs)(e.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[(0,i.jsx)(e.span,{className:"pstrut",style:{height:"2.7em"}}),(0,i.jsx)(e.span,{className:"sizing reset-size6 size3 mtight",children:(0,i.jsx)(e.span,{className:"mord mtight",children:"5"})})]})})})})})]}),(0,i.jsx)(e.span,{className:"mspace",style:{marginRight:"0.2778em"}}),(0,i.jsx)(e.span,{className:"mrel",children:"="}),(0,i.jsx)(e.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),(0,i.jsxs)(e.span,{className:"base",children:[(0,i.jsx)(e.span,{className:"strut",style:{height:"0.6444em"}}),(0,i.jsx)(e.span,{className:"mord",children:"3125"})]})]})]}),")."]}),"\n",(0,i.jsxs)(e.p,{children:["Next, navigate to the ",(0,i.jsx)(e.code,{children:"cli/"})," directory and edit ",(0,i.jsx)(e.code,{children:"zkeys.config.yml"}),"."]}),"\n",(0,i.jsx)(e.p,{children:"This config file defines the parameters required for MACI's circuits."}),"\n",(0,i.jsx)(e.h3,{id:"message-processing",children:"Message processing"}),"\n",(0,i.jsxs)(e.table,{children:[(0,i.jsx)(e.thead,{children:(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.th,{children:"#"}),(0,i.jsx)(e.th,{children:"Parameter"}),(0,i.jsx)(e.th,{children:"Description"})]})}),(0,i.jsxs)(e.tbody,{children:[(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"0"}),(0,i.jsx)(e.td,{children:"State tree depth"}),(0,i.jsx)(e.td,{children:"Should be set to 10. Allows 9,765,625 signups."})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"1"}),(0,i.jsx)(e.td,{children:"Message tree depth"}),(0,i.jsxs)(e.td,{children:["Allows ",(0,i.jsxs)(e.span,{className:"katex",children:[(0,i.jsx)(e.span,{className:"katex-mathml",children:(0,i.jsx)(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:(0,i.jsxs)(e.semantics,{children:[(0,i.jsxs)(e.mrow,{children:[(0,i.jsx)(e.mo,{stretchy:"false",children:"("}),(0,i.jsxs)(e.msup,{children:[(0,i.jsx)(e.mn,{children:"5"}),(0,i.jsx)(e.mi,{children:"n"})]}),(0,i.jsx)(e.mo,{stretchy:"false",children:")"})]}),(0,i.jsx)(e.annotation,{encoding:"application/x-tex",children:"(5^{n})"})]})})}),(0,i.jsx)(e.span,{className:"katex-html","aria-hidden":"true",children:(0,i.jsxs)(e.span,{className:"base",children:[(0,i.jsx)(e.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),(0,i.jsx)(e.span,{className:"mopen",children:"("}),(0,i.jsxs)(e.span,{className:"mord",children:[(0,i.jsx)(e.span,{className:"mord",children:"5"}),(0,i.jsx)(e.span,{className:"msupsub",children:(0,i.jsx)(e.span,{className:"vlist-t",children:(0,i.jsx)(e.span,{className:"vlist-r",children:(0,i.jsx)(e.span,{className:"vlist",style:{height:"0.6644em"},children:(0,i.jsxs)(e.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[(0,i.jsx)(e.span,{className:"pstrut",style:{height:"2.7em"}}),(0,i.jsx)(e.span,{className:"sizing reset-size6 size3 mtight",children:(0,i.jsx)(e.span,{className:"mord mtight",children:(0,i.jsx)(e.span,{className:"mord mathnormal mtight",children:"n"})})})]})})})})})]}),(0,i.jsx)(e.span,{className:"mclose",children:")"})]})})]})," votes or key-change messages."]})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"2"}),(0,i.jsx)(e.td,{children:"Message batch tree depth"}),(0,i.jsxs)(e.td,{children:["Allows ",(0,i.jsxs)(e.span,{className:"katex",children:[(0,i.jsx)(e.span,{className:"katex-mathml",children:(0,i.jsx)(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:(0,i.jsxs)(e.semantics,{children:[(0,i.jsxs)(e.mrow,{children:[(0,i.jsx)(e.mo,{stretchy:"false",children:"("}),(0,i.jsxs)(e.msup,{children:[(0,i.jsx)(e.mn,{children:"5"}),(0,i.jsx)(e.mi,{children:"n"})]}),(0,i.jsx)(e.mo,{stretchy:"false",children:")"})]}),(0,i.jsx)(e.annotation,{encoding:"application/x-tex",children:"(5^{n})"})]})})}),(0,i.jsx)(e.span,{className:"katex-html","aria-hidden":"true",children:(0,i.jsxs)(e.span,{className:"base",children:[(0,i.jsx)(e.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),(0,i.jsx)(e.span,{className:"mopen",children:"("}),(0,i.jsxs)(e.span,{className:"mord",children:[(0,i.jsx)(e.span,{className:"mord",children:"5"}),(0,i.jsx)(e.span,{className:"msupsub",children:(0,i.jsx)(e.span,{className:"vlist-t",children:(0,i.jsx)(e.span,{className:"vlist-r",children:(0,i.jsx)(e.span,{className:"vlist",style:{height:"0.6644em"},children:(0,i.jsxs)(e.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[(0,i.jsx)(e.span,{className:"pstrut",style:{height:"2.7em"}}),(0,i.jsx)(e.span,{className:"sizing reset-size6 size3 mtight",children:(0,i.jsx)(e.span,{className:"mord mtight",children:(0,i.jsx)(e.span,{className:"mord mathnormal mtight",children:"n"})})})]})})})})})]}),(0,i.jsx)(e.span,{className:"mclose",children:")"})]})})]})," messages to be processed per batch."]})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"3"}),(0,i.jsx)(e.td,{children:"Vote option tree depth"}),(0,i.jsxs)(e.td,{children:["Allows ",(0,i.jsxs)(e.span,{className:"katex",children:[(0,i.jsx)(e.span,{className:"katex-mathml",children:(0,i.jsx)(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:(0,i.jsxs)(e.semantics,{children:[(0,i.jsxs)(e.mrow,{children:[(0,i.jsx)(e.mo,{stretchy:"false",children:"("}),(0,i.jsxs)(e.msup,{children:[(0,i.jsx)(e.mn,{children:"5"}),(0,i.jsx)(e.mi,{children:"n"})]}),(0,i.jsx)(e.mo,{stretchy:"false",children:")"})]}),(0,i.jsx)(e.annotation,{encoding:"application/x-tex",children:"(5^{n})"})]})})}),(0,i.jsx)(e.span,{className:"katex-html","aria-hidden":"true",children:(0,i.jsxs)(e.span,{className:"base",children:[(0,i.jsx)(e.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),(0,i.jsx)(e.span,{className:"mopen",children:"("}),(0,i.jsxs)(e.span,{className:"mord",children:[(0,i.jsx)(e.span,{className:"mord",children:"5"}),(0,i.jsx)(e.span,{className:"msupsub",children:(0,i.jsx)(e.span,{className:"vlist-t",children:(0,i.jsx)(e.span,{className:"vlist-r",children:(0,i.jsx)(e.span,{className:"vlist",style:{height:"0.6644em"},children:(0,i.jsxs)(e.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[(0,i.jsx)(e.span,{className:"pstrut",style:{height:"2.7em"}}),(0,i.jsx)(e.span,{className:"sizing reset-size6 size3 mtight",children:(0,i.jsx)(e.span,{className:"mord mtight",children:(0,i.jsx)(e.span,{className:"mord mathnormal mtight",children:"n"})})})]})})})})})]}),(0,i.jsx)(e.span,{className:"mclose",children:")"})]})})]})," vote options."]})]})]})]}),"\n",(0,i.jsx)(e.h3,{id:"vote-tallying",children:"Vote tallying"}),"\n",(0,i.jsxs)(e.table,{children:[(0,i.jsx)(e.thead,{children:(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.th,{children:"#"}),(0,i.jsx)(e.th,{children:"Parameter"}),(0,i.jsx)(e.th,{children:"Description"})]})}),(0,i.jsxs)(e.tbody,{children:[(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"0"}),(0,i.jsx)(e.td,{children:"State tree depth"}),(0,i.jsx)(e.td,{children:"Should be set to 10. Allows 9,765,625 signups."})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"1"}),(0,i.jsx)(e.td,{children:"State leaf batch depth"}),(0,i.jsxs)(e.td,{children:["Allows ",(0,i.jsxs)(e.span,{className:"katex",children:[(0,i.jsx)(e.span,{className:"katex-mathml",children:(0,i.jsx)(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:(0,i.jsxs)(e.semantics,{children:[(0,i.jsxs)(e.mrow,{children:[(0,i.jsx)(e.mo,{stretchy:"false",children:"("}),(0,i.jsxs)(e.msup,{children:[(0,i.jsx)(e.mn,{children:"5"}),(0,i.jsx)(e.mi,{children:"n"})]}),(0,i.jsx)(e.mo,{stretchy:"false",children:")"})]}),(0,i.jsx)(e.annotation,{encoding:"application/x-tex",children:"(5^{n})"})]})})}),(0,i.jsx)(e.span,{className:"katex-html","aria-hidden":"true",children:(0,i.jsxs)(e.span,{className:"base",children:[(0,i.jsx)(e.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),(0,i.jsx)(e.span,{className:"mopen",children:"("}),(0,i.jsxs)(e.span,{className:"mord",children:[(0,i.jsx)(e.span,{className:"mord",children:"5"}),(0,i.jsx)(e.span,{className:"msupsub",children:(0,i.jsx)(e.span,{className:"vlist-t",children:(0,i.jsx)(e.span,{className:"vlist-r",children:(0,i.jsx)(e.span,{className:"vlist",style:{height:"0.6644em"},children:(0,i.jsxs)(e.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[(0,i.jsx)(e.span,{className:"pstrut",style:{height:"2.7em"}}),(0,i.jsx)(e.span,{className:"sizing reset-size6 size3 mtight",children:(0,i.jsx)(e.span,{className:"mord mtight",children:(0,i.jsx)(e.span,{className:"mord mathnormal mtight",children:"n"})})})]})})})})})]}),(0,i.jsx)(e.span,{className:"mclose",children:")"})]})})]})," users' votes to be processed per batch."]})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"2"}),(0,i.jsx)(e.td,{children:"Vote option tree depth"}),(0,i.jsxs)(e.td,{children:["Allows ",(0,i.jsxs)(e.span,{className:"katex",children:[(0,i.jsx)(e.span,{className:"katex-mathml",children:(0,i.jsx)(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:(0,i.jsxs)(e.semantics,{children:[(0,i.jsxs)(e.mrow,{children:[(0,i.jsx)(e.mo,{stretchy:"false",children:"("}),(0,i.jsxs)(e.msup,{children:[(0,i.jsx)(e.mn,{children:"5"}),(0,i.jsx)(e.mi,{children:"n"})]}),(0,i.jsx)(e.mo,{stretchy:"false",children:")"})]}),(0,i.jsx)(e.annotation,{encoding:"application/x-tex",children:"(5^{n})"})]})})}),(0,i.jsx)(e.span,{className:"katex-html","aria-hidden":"true",children:(0,i.jsxs)(e.span,{className:"base",children:[(0,i.jsx)(e.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),(0,i.jsx)(e.span,{className:"mopen",children:"("}),(0,i.jsxs)(e.span,{className:"mord",children:[(0,i.jsx)(e.span,{className:"mord",children:"5"}),(0,i.jsx)(e.span,{className:"msupsub",children:(0,i.jsx)(e.span,{className:"vlist-t",children:(0,i.jsx)(e.span,{className:"vlist-r",children:(0,i.jsx)(e.span,{className:"vlist",style:{height:"0.6644em"},children:(0,i.jsxs)(e.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[(0,i.jsx)(e.span,{className:"pstrut",style:{height:"2.7em"}}),(0,i.jsx)(e.span,{className:"sizing reset-size6 size3 mtight",children:(0,i.jsx)(e.span,{className:"mord mtight",children:(0,i.jsx)(e.span,{className:"mord mathnormal mtight",children:"n"})})})]})})})})})]}),(0,i.jsx)(e.span,{className:"mclose",children:")"})]})})]})," vote options."]})]})]})]}),"\n",(0,i.jsx)(e.h3,{id:"subsisdy",children:"Subsisdy"}),"\n",(0,i.jsxs)(e.table,{children:[(0,i.jsx)(e.thead,{children:(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.th,{children:"#"}),(0,i.jsx)(e.th,{children:"Parameter"}),(0,i.jsx)(e.th,{children:"Description"})]})}),(0,i.jsxs)(e.tbody,{children:[(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"0"}),(0,i.jsx)(e.td,{children:"State tree depth"}),(0,i.jsx)(e.td,{children:"Should be set to 10. Allows 9,765,625 signups."})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"1"}),(0,i.jsx)(e.td,{children:"State leaf batch depth"}),(0,i.jsxs)(e.td,{children:["Allows ",(0,i.jsxs)(e.span,{className:"katex",children:[(0,i.jsx)(e.span,{className:"katex-mathml",children:(0,i.jsx)(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:(0,i.jsxs)(e.semantics,{children:[(0,i.jsxs)(e.mrow,{children:[(0,i.jsx)(e.mo,{stretchy:"false",children:"("}),(0,i.jsxs)(e.msup,{children:[(0,i.jsx)(e.mn,{children:"5"}),(0,i.jsx)(e.mi,{children:"n"})]}),(0,i.jsx)(e.mo,{stretchy:"false",children:")"})]}),(0,i.jsx)(e.annotation,{encoding:"application/x-tex",children:"(5^{n})"})]})})}),(0,i.jsx)(e.span,{className:"katex-html","aria-hidden":"true",children:(0,i.jsxs)(e.span,{className:"base",children:[(0,i.jsx)(e.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),(0,i.jsx)(e.span,{className:"mopen",children:"("}),(0,i.jsxs)(e.span,{className:"mord",children:[(0,i.jsx)(e.span,{className:"mord",children:"5"}),(0,i.jsx)(e.span,{className:"msupsub",children:(0,i.jsx)(e.span,{className:"vlist-t",children:(0,i.jsx)(e.span,{className:"vlist-r",children:(0,i.jsx)(e.span,{className:"vlist",style:{height:"0.6644em"},children:(0,i.jsxs)(e.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[(0,i.jsx)(e.span,{className:"pstrut",style:{height:"2.7em"}}),(0,i.jsx)(e.span,{className:"sizing reset-size6 size3 mtight",children:(0,i.jsx)(e.span,{className:"mord mtight",children:(0,i.jsx)(e.span,{className:"mord mathnormal mtight",children:"n"})})})]})})})})})]}),(0,i.jsx)(e.span,{className:"mclose",children:")"})]})})]})," users' votes to be processed per batch."]})]}),(0,i.jsxs)(e.tr,{children:[(0,i.jsx)(e.td,{children:"2"}),(0,i.jsx)(e.td,{children:"Vote option tree depth"}),(0,i.jsxs)(e.td,{children:["Allows ",(0,i.jsxs)(e.span,{className:"katex",children:[(0,i.jsx)(e.span,{className:"katex-mathml",children:(0,i.jsx)(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:(0,i.jsxs)(e.semantics,{children:[(0,i.jsxs)(e.mrow,{children:[(0,i.jsx)(e.mo,{stretchy:"false",children:"("}),(0,i.jsxs)(e.msup,{children:[(0,i.jsx)(e.mn,{children:"5"}),(0,i.jsx)(e.mi,{children:"n"})]}),(0,i.jsx)(e.mo,{stretchy:"false",children:")"})]}),(0,i.jsx)(e.annotation,{encoding:"application/x-tex",children:"(5^{n})"})]})})}),(0,i.jsx)(e.span,{className:"katex-html","aria-hidden":"true",children:(0,i.jsxs)(e.span,{className:"base",children:[(0,i.jsx)(e.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),(0,i.jsx)(e.span,{className:"mopen",children:"("}),(0,i.jsxs)(e.span,{className:"mord",children:[(0,i.jsx)(e.span,{className:"mord",children:"5"}),(0,i.jsx)(e.span,{className:"msupsub",children:(0,i.jsx)(e.span,{className:"vlist-t",children:(0,i.jsx)(e.span,{className:"vlist-r",children:(0,i.jsx)(e.span,{className:"vlist",style:{height:"0.6644em"},children:(0,i.jsxs)(e.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[(0,i.jsx)(e.span,{className:"pstrut",style:{height:"2.7em"}}),(0,i.jsx)(e.span,{className:"sizing reset-size6 size3 mtight",children:(0,i.jsx)(e.span,{className:"mord mtight",children:(0,i.jsx)(e.span,{className:"mord mathnormal mtight",children:"n"})})})]})})})})})]}),(0,i.jsx)(e.span,{className:"mclose",children:")"})]})})]})," vote options."]})]})]})]}),"\n",(0,i.jsx)(e.h2,{id:"compile-circuits",children:"Compile circuits"}),"\n",(0,i.jsx)(e.h3,{id:"prerequisites",children:"Prerequisites"}),"\n",(0,i.jsx)(e.p,{children:"Before building the project, make sure you have the following dependencies installed:"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:(0,i.jsx)(e.a,{href:"https://docs.circom.io/downloads/downloads/",children:"circom"})}),"\n"]}),"\n",(0,i.jsx)(e.h3,{id:"building-maci-circuits",children:"Building MACI circuits"}),"\n",(0,i.jsx)(e.p,{children:"To build the two main circuits of MACI, run the following commands:"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{children:"circom --r1cs --sym --wasm --output ./build circom/test/processMessages_test.circom\ncircom --r1cs --sym --wasm --output ./build circom/test/tallyVotes_test.circom\n"})}),"\n",(0,i.jsxs)(e.p,{children:["Please note that the circuit is configured with testing purpose parameters, which means it can only handle a limited amount of messages (up to 25 messages). For more information on the parameters and how to configure them, refer to ",(0,i.jsx)(e.a,{href:"https://maci.pse.dev/docs/circuits.html#compile-circuits",children:"this page"}),"."]}),"\n",(0,i.jsx)(e.h3,{id:"generating-zkeys",children:"Generating zKeys"}),"\n",(0,i.jsx)(e.p,{children:"Run:"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-bash",children:"npx zkey-manager compile -c ./zkeys.config.yml\n"})}),"\n",(0,i.jsx)(e.p,{children:"The larger the trees, the more time this process may take. You may also need a\nmachine with a very large amount of memory."}),"\n",(0,i.jsx)(e.h4,{id:"measure-the-circuit-sizes",children:"Measure the circuit sizes"}),"\n",(0,i.jsxs)(e.p,{children:["The size of a circuit is denoted by its number of constraints. The larger this\nnumber, the more time it takes to compile it, generate its ",(0,i.jsx)(e.code,{children:".zkey"})," file, and\nperform phase 2 contributions."]}),"\n",(0,i.jsx)(e.p,{children:"Run this command to measure a circuit:"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-bash",children:"npx snarkjs r1cs info CIRCUIT_NAME.circom\n"})}),"\n",(0,i.jsxs)(e.h4,{id:"download-the-ptau-file",children:["Download the ",(0,i.jsx)(e.code,{children:".ptau"})," file"]}),"\n",(0,i.jsxs)(e.p,{children:["This file should be the result of the Perpetual Powers of Tau trusted setup\ncontribution which ",(0,i.jsx)(e.a,{href:"https://blog.hermez.io/hermez-cryptographic-setup/",children:"Hermez Network\nselected"}),"."]}),"\n",(0,i.jsx)(e.p,{children:"Run:"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-bash",children:"npx zkey-manager downloadPtau -c ./zkeys.config.yml\n"})}),"\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.code,{children:"zkey-manager"})," will select the smallest ",(0,i.jsx)(e.code,{children:".ptau"})," file that fits the largest\ncircuit specified in ",(0,i.jsx)(e.code,{children:"zkeys.config.yml"}),"."]}),"\n",(0,i.jsx)(e.h3,{id:"generating-and-validating-zk-proofs",children:"Generating and Validating ZK Proofs"}),"\n",(0,i.jsxs)(e.p,{children:["To generate and validate ZK proofs from the artifacts produced by ",(0,i.jsx)(e.code,{children:"circom"}),", you will need ",(0,i.jsx)(e.a,{href:"https://github.com/iden3/snarkjs#groth16-1",children:(0,i.jsx)(e.code,{children:"snarkjs"})}),"."]}),"\n",(0,i.jsx)(e.h2,{id:"testing",children:"Testing"}),"\n",(0,i.jsxs)(e.p,{children:["To test the circuits package, please use ",(0,i.jsx)(e.code,{children:"npm run test"}),". This will run all of the tests inside the tests folder."]}),"\n",(0,i.jsxs)(e.p,{children:["To run individual tests, you can use the following commands (for all other circuits please refer to the ",(0,i.jsx)(e.code,{children:"package.json"})," scripts section):"]}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.code,{children:"npm run test-processMessages"})," to run the tests for the ",(0,i.jsx)(e.code,{children:"processMessages"})," circuit."]}),"\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.code,{children:"npm run test-tallyVotes"})," to run the tests for the ",(0,i.jsx)(e.code,{children:"tallyVotes"})," circuit."]}),"\n"]})]})}function m(s={}){const{wrapper:e}={...(0,t.a)(),...s.components};return e?(0,i.jsx)(e,{...s,children:(0,i.jsx)(d,{...s})}):d(s)}},1151:(s,e,n)=>{n.d(e,{Z:()=>c,a:()=>l});var i=n(7294);const t={},a=i.createContext(t);function l(s){const e=i.useContext(a);return i.useMemo((function(){return"function"==typeof s?s(e):{...e,...s}}),[e,s])}function c(s){let e;return e=s.disableParentContext?"function"==typeof s.components?s.components(t):s.components||t:l(s.components),i.createElement(a.Provider,{value:e},s.children)}}}]);