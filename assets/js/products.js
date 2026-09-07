import { fetchCatalog } from './api.js';

export const products = [
  {id:1,name:'Vestido Florido',slug:'vestido-florido',theme:'fem',category:'vestido',price:89.90,oldPrice:109.90,badge:'Novidade',icon:'👗',rating:4.9,reviews:37,description:'Vestido leve e delicado para dias de passeio, festa e muita brincadeira. Modelagem confortável, acabamento suave e caimento soltinho.',colors:['Rosa','Lilás'],sizes:['2','4','6','8','10','12'],stock:{'Rosa|2':4,'Rosa|4':6,'Rosa|6':8,'Rosa|8':5,'Rosa|10':3,'Rosa|12':2,'Lilás|2':2,'Lilás|4':3,'Lilás|6':4,'Lilás|8':3,'Lilás|10':2,'Lilás|12':1},details:['Tecido leve e confortável','Acabamento delicado','Lavagem fácil','Produção selecionada para uso infantil'],images:[]},
  {id:2,name:'Conjunto Tule Rosa',slug:'conjunto-tule-rosa',theme:'fem',category:'conjunto',price:109.90,oldPrice:null,badge:'Mais vendido',icon:'🎀',rating:4.8,reviews:24,description:'Conjunto charmoso com visual delicado e confortável para ocasiões especiais sem perder a liberdade de brincar.',colors:['Rosa'],sizes:['2','4','6','8','10'],stock:{'Rosa|2':2,'Rosa|4':4,'Rosa|6':3,'Rosa|8':2,'Rosa|10':1},details:['Conjunto completo','Toque macio','Modelagem confortável'],images:[]},
  {id:3,name:'Saia Plissada',slug:'saia-plissada',theme:'fem',category:'saia',price:64.90,oldPrice:79.90,badge:'-19%',icon:'🌸',rating:4.7,reviews:18,description:'Saia plissada versátil, leve e fácil de combinar com camisetas, blusas e acessórios.',colors:['Rosa','Off-white'],sizes:['4','6','8','10','12'],stock:{'Rosa|4':2,'Rosa|6':1,'Rosa|8':2,'Rosa|10':1,'Rosa|12':1,'Off-white|4':2,'Off-white|6':2,'Off-white|8':1,'Off-white|10':1,'Off-white|12':1},details:['Cintura confortável','Tecido leve','Plissado delicado'],images:[]},
  {id:4,name:'Laço Duplo',slug:'laco-duplo',theme:'fem',category:'acessorio',price:24.90,oldPrice:null,badge:'Acessório',icon:'🎀',rating:4.9,reviews:42,description:'Laço duplo para completar o look com um toque delicado.',colors:['Rosa','Lilás','Vermelho'],sizes:['Único'],stock:{'Rosa|Único':18,'Lilás|Único':12,'Vermelho|Único':10},details:['Presilha firme','Acabamento macio'],images:[]},
  {id:5,name:'Camiseta Dino',slug:'camiseta-dino',theme:'masc',category:'camiseta',price:54.90,oldPrice:null,badge:'Novidade',icon:'🦕',rating:4.9,reviews:31,description:'Camiseta confortável com estampa divertida para acompanhar aventuras do dia inteiro.',colors:['Azul','Verde'],sizes:['2','4','6','8','10','12'],stock:{'Azul|2':5,'Azul|4':6,'Azul|6':5,'Azul|8':4,'Azul|10':3,'Azul|12':2,'Verde|2':3,'Verde|4':3,'Verde|6':2,'Verde|8':2,'Verde|10':1,'Verde|12':1},details:['Malha confortável','Estampa macia','Gola reforçada'],images:[]},
  {id:6,name:'Bermuda Cargo',slug:'bermuda-cargo',theme:'masc',category:'bermuda',price:69.90,oldPrice:79.90,badge:'Últimas unidades',icon:'🩳',rating:4.6,reviews:15,description:'Bermuda cargo prática para brincar, passear e guardar pequenos tesouros nos bolsos.',colors:['Caqui','Azul'],sizes:['4','6','8','10','12'],stock:{'Caqui|4':1,'Caqui|6':1,'Caqui|8':0,'Caqui|10':1,'Caqui|12':0,'Azul|4':0,'Azul|6':1,'Azul|8':1,'Azul|10':0,'Azul|12':1},details:['Bolsos funcionais','Cós confortável','Modelagem casual'],images:[]},
  {id:7,name:'Boné Aventura',slug:'bone-aventura',theme:'masc',category:'acessorio',price:39.90,oldPrice:null,badge:'Acessório',icon:'🧢',rating:4.8,reviews:21,description:'Boné ajustável, leve e divertido para completar os looks de passeio.',colors:['Azul','Verde'],sizes:['Único'],stock:{'Azul|Único':8,'Verde|Único':7},details:['Ajuste traseiro','Leve e confortável'],images:[]},
  {id:8,name:'Conjunto Explorador',slug:'conjunto-explorador',theme:'masc',category:'conjunto',price:99.90,oldPrice:119.90,badge:'Oferta',icon:'🚙',rating:4.9,reviews:28,description:'Conjunto pronto para brincar com conforto e visual aventureiro.',colors:['Azul','Verde'],sizes:['2','4','6','8','10'],stock:{'Azul|2':2,'Azul|4':2,'Azul|6':2,'Azul|8':1,'Azul|10':1,'Verde|2':1,'Verde|4':2,'Verde|6':1,'Verde|8':1,'Verde|10':1},details:['Duas peças','Tecido confortável','Combinação prática'],images:[]}
];

export async function loadLiveProducts(){
  try{
    const live = await fetchCatalog();
    if(Array.isArray(live) && live.length){ products.splice(0, products.length, ...live); return true; }
  }catch(error){ console.warn('[Pingo Chic] catálogo local em uso:', error.message); }
  return false;
}

export const formatBRL = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
export const getProduct = id => products.find(product => product.id === Number(id));
export const getVariantStock = (product,color,size) => product?.stock?.[`${color}|${size}`] ?? 0;
