export type Asset={symbol:string;name:string;address:string;theme:string;description:string};
export const assets:Asset[]=[
{symbol:'NVDAc',name:'NVIDIA',address:'0xb20000000000000000000000000000000000108C',theme:'AI infrastructure',description:'Tokenized NVIDIA exposure issued as a B20 token on Base.'},
{symbol:'AAPLc',name:'Apple',address:'0xb20000000000000000000000000000000000d1fb',theme:'Consumer technology',description:'Tokenized Apple exposure on Base.'},
{symbol:'MSFTc',name:'Microsoft',address:'0xb20000000000000000000000000000000000872B',theme:'AI software',description:'Tokenized Microsoft exposure on Base.'},
{symbol:'TSLAc',name:'Tesla',address:'0xb200000000000000000000000000000000000cD0',theme:'Robotics & mobility',description:'Tokenized Tesla exposure on Base.'},
{symbol:'META',name:'Meta',address:'0xb20000000000000000000000000000000000707C',theme:'AI & social',description:'Tokenized Meta exposure on Base.'}
];
export const theses=[{id:'ai-infrastructure',title:'AI infrastructure is still early',creator:'@maya',avatar:'M',summary:'Own the picks-and-shovels layer of the AI cycle: compute, platforms, and distribution.',tags:['AI','long-term'],assets:[['NVDAc',35],['MSFTc',25],['AAPLc',20],['META',20]]},{id:'builders',title:'The builders compound',creator:'@atlas',avatar:'A',summary:'A concentrated basket around companies turning software and compute into durable platforms.',tags:['software','AI'],assets:[['NVDAc',40],['MSFTc',35],['META',25]]}];
