export type Asset={symbol:string;name:string;address:string;theme:string;description:string};
export const assets:Asset[]=[
{symbol:'NVDAc',name:'NVIDIA',address:'0xb20000000000000000000078ee7ce2fE4908108C',theme:'AI infrastructure',description:'Coinbase Tokenized Stock on Base.'},
{symbol:'AAPLc',name:'Apple',address:'0xb200000000000000000000C2e324d24d7eEcd1fb',theme:'Consumer technology',description:'Coinbase Tokenized Stock on Base.'},
{symbol:'MSFTc',name:'Microsoft',address:'0xB200000000000000000000Ab99cFa739E253872B',theme:'AI software',description:'Coinbase Tokenized Stock on Base.'},
{symbol:'TSLAc',name:'Tesla',address:'0xb2000000000000000000001e800a7f5189430cD0',theme:'Robotics & mobility',description:'Coinbase Tokenized Stock on Base.'},
{symbol:'METAc',name:'Meta',address:'0xb2000000000000000000008bC8786B856E61707C',theme:'AI & social',description:'Coinbase Tokenized Stock on Base.'}
];
export const theses=[{id:'ai-infrastructure',title:'AI infrastructure is still early',creator:'@maya',avatar:'M',summary:'Own the picks-and-shovels layer of the AI cycle: compute, platforms, and distribution.',tags:['AI','long-term'],assets:[['NVDAc',35],['MSFTc',25],['AAPLc',20],['METAc',20]]},{id:'builders',title:'The builders compound',creator:'@atlas',avatar:'A',summary:'A concentrated basket around companies turning software and compute into durable platforms.',tags:['software','AI'],assets:[['NVDAc',40],['MSFTc',35],['METAc',25]]}];
