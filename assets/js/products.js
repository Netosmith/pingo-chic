export const products = [
  {id:1,name:'Vestido Florido',theme:'fem',category:'vestido',price:89.90,oldPrice:109.90,badge:'Novidade',icon:'👗'},
  {id:2,name:'Conjunto Tule Rosa',theme:'fem',category:'conjunto',price:109.90,oldPrice:null,badge:'Mais vendido',icon:'🎀'},
  {id:3,name:'Saia Plissada',theme:'fem',category:'saia',price:64.90,oldPrice:79.90,badge:'-19%',icon:'🌸'},
  {id:4,name:'Laço Duplo',theme:'fem',category:'acessorio',price:24.90,oldPrice:null,badge:'Acessório',icon:'🎀'},
  {id:5,name:'Camiseta Dino',theme:'masc',category:'camiseta',price:54.90,oldPrice:null,badge:'Novidade',icon:'🦕'},
  {id:6,name:'Bermuda Cargo',theme:'masc',category:'bermuda',price:69.90,oldPrice:79.90,badge:'Últimas unidades',icon:'🩳'},
  {id:7,name:'Boné Aventura',theme:'masc',category:'acessorio',price:39.90,oldPrice:null,badge:'Acessório',icon:'🧢'},
  {id:8,name:'Conjunto Explorador',theme:'masc',category:'conjunto',price:99.90,oldPrice:119.90,badge:'Oferta',icon:'🚙'}
];

export const formatBRL = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
