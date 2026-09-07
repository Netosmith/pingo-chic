INSERT OR IGNORE INTO products (id,slug,name,description,theme,category,price_cents,old_price_cents,badge,rating,reviews_count,details_json,active) VALUES
(1,'vestido-florido','Vestido Florido','Vestido leve e delicado para dias de passeio, festa e muita brincadeira.','fem','vestido',8990,10990,'Novidade',4.9,37,'["Tecido leve e confortável","Acabamento delicado","Lavagem fácil"]',1),
(2,'conjunto-tule-rosa','Conjunto Tule Rosa','Conjunto charmoso com visual delicado e confortável.','fem','conjunto',10990,NULL,'Mais vendido',4.8,24,'["Conjunto completo","Toque macio","Modelagem confortável"]',1),
(5,'camiseta-dino','Camiseta Dino','Camiseta confortável com estampa divertida para acompanhar aventuras do dia inteiro.','masc','camiseta',5490,NULL,'Novidade',4.9,31,'["Malha confortável","Estampa macia","Gola reforçada"]',1),
(8,'conjunto-explorador','Conjunto Explorador','Conjunto pronto para brincar com conforto e visual aventureiro.','masc','conjunto',9990,11990,'Oferta',4.9,28,'["Duas peças","Tecido confortável","Combinação prática"]',1);

INSERT OR IGNORE INTO product_variants (sku,product_id,size,color,stock) VALUES
('VF-ROSA-4',1,'4','Rosa',6),('VF-ROSA-6',1,'6','Rosa',8),('VF-LILAS-6',1,'6','Lilás',4),
('CTR-ROSA-4',2,'4','Rosa',4),('CTR-ROSA-6',2,'6','Rosa',3),
('CD-AZUL-4',5,'4','Azul',6),('CD-AZUL-6',5,'6','Azul',5),('CD-VERDE-6',5,'6','Verde',2),
('CE-AZUL-4',8,'4','Azul',2),('CE-VERDE-6',8,'6','Verde',1);
