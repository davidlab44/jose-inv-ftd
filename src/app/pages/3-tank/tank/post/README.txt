TANK PAGE v2

Archivos:
tank.ts
tank.html
tank.scss
tank.module.ts
tank-routing.module.ts

DIMENSIONES:
- Largo shell: 6.00 m
- Radio: 1.13 m
- Diámetro geométrico: 2.26 m
- Circunferencia indicada: 7.13 m

IMPORTANTE:
El dato aproximado de ancho fue 2 m, pero radio 1.13 m implica diámetro 2.26 m.
Además, 2*pi*1.13 = aproximadamente 7.10 m, muy próximo a la medición real de 7.13 m.
Por eso esta versión usa radio 1.13 m como geometría.

LADOS:
1 = extremo frontal
2 = lateral derecho
3 = extremo posterior
4 = lateral izquierdo
5 = abajo
6 = arriba

Esta versión:
- usa cabezas curvas;
- muestra números 1 a 6;
- divide el shell en zonas;
- marca amarillo al seleccionar;
- calcula m2;
- agrega nota;
- genera payload para Work Order por console.log.

Dependencias:
npm install three
npm install --save-dev @types/three
