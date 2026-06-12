import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el Seeding...');

  console.log('Limpiando tablas de pedidos, productos y categorías para evitar mezcla de precios (USD vs COP)...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  console.log('Limpieza completada.');

  const passwordHash = await bcrypt.hash('admin123', 10);

  const users = [
    { name: 'Admin', email: 'admin@newera.com', password: passwordHash, phone: '3000000000', role: 'ADMIN' },
    { name: 'Juan', email: 'customer@newera.com', password: passwordHash, phone: '3000000001', role: 'CUSTOMER' },
    { name: 'Brian', email: 'deliverer@newera.com', password: passwordHash, phone: '3000000002', role: 'DELIVERER' },
    { name: 'Cajero', email: 'cashier@newera.com', password: passwordHash, phone: '3000000003', role: 'CASHIER' }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  console.log('Usuarios verificados: ADMIN, CUSTOMER, DELIVERER, CASHIER (Contraseña: admin123)');

  // Categorías ordenadas alfabéticamente (A-Z) con 5 productos cada una = 100 productos
  const datosSemilla = [
    {
      categoria: 'Abarrotes',
      productos: [
        { name: 'Arroz Diana Vitamor 1kg', price: 4800, stock: 120, description: 'Arroz blanco de grano seleccionado, fortificado.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/28955925/Arroz-Diana-1000-gr-552155_a.jpg?v=638864002504830000' },
        { name: 'Aceite de Girasol Premier 1L', price: 17900, stock: 80, description: 'Aceite de girasol 100% puro para cocinar.', imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_2X_775728-MLA92706725257_092025-F.webp' },
        { name: 'Frijol Bola Roja Aburrá 500g', price: 6400, stock: 150, description: 'Frijol seco seleccionado, ideal para bandeja paisa.', imageUrl: 'https://exitocol.vteximg.com.br/arquivos/ids/33544092/Frijol-Bola-Roja-ABURRA-500-gr-3533418_a.jpg?v=639154430861300000' },
        { name: 'Café Molido Sello Rojo 500g', price: 14900, stock: 100, description: 'Café tradicional colombiano con aroma y sabor únicos.', imageUrl: 'https://carulla.vtexassets.com/arquivos/ids/21742420/CAFE-MOLIDO-LAMINADO-483224_a.jpg?v=638876686361600000' },
        { name: 'Pasta Doria Espagueti 500g', price: 3700, stock: 200, description: 'Pasta alimenticia enriquecida a base de sémola.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/31753517/Pasta-Clasica-Spaghetti-X-500-gr-13653_a.jpg?v=638986364723170000' }
      ]
    },
    {
      categoria: 'Bebés',
      productos: [
        { name: 'Pañales Pequeñín Etapa 3 (30 un)', price: 25900, stock: 50, description: 'Pañales super absorbentes.', imageUrl: 'https://mercaenlinea.nyc3.digitaloceanspaces.com/2019/07/pan%CC%83ales_pequen%CC%83in_etapa_3_acolchamax.jpg' },
        { name: 'Toallitas Húmedas Pequeñín (80 un)', price: 8500, stock: 80, description: 'Con aloe vera y manzanilla.', imageUrl: 'https://www.elmundodelaura.com/cdn/shop/files/panitospequeninmanzanilla.jpg?v=1713017233' },
        { name: 'Crema Antipañalitis Desitin 57g', price: 18900, stock: 40, description: 'Alivio rápido y prevención.', imageUrl: 'https://copservir.vtexassets.com/arquivos/ids/1879382-1200-auto?v=639107777127970000&width=1200&height=auto&aspect=true' },
        { name: 'Shampoo Johnson\'s Baby 400ml', price: 15400, stock: 60, description: 'Fórmula no más lágrimas.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/33638951/Johnsons-Baby-Shampoo-Original-X-400-ml-1472447_a.jpg?v=639161770971900000' },
        { name: 'Compota Heinz Manzana 113g', price: 3200, stock: 100, description: 'Puré de fruta 10₀% natural.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/29821190/Compota-Manzana-Frasco-420192_a.jpg?v=638918957446730000' }
      ]
    },
    {
      categoria: 'Bebidas',
      productos: [
        { name: 'Gaseosa Coca-Cola Original 1.5L', price: 5400, stock: 120, description: 'Bebida carbonatada refrescante sabor cola.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/33386748/BEBIDA-GASEOSA-ORIGINAL-1554892_a.jpg?v=639142783398030000' },
        { name: 'Cerveza Club Colombia Dorada 330ml (Lata)', price: 3500, stock: 200, description: 'Cerveza premium de tipo lager.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/32289832/CERVEZA-LATA-DORADA-102127_a.jpg?v=639045296790830000' },
        { name: 'Agua Mineral Manantial Sin Gas 500ml', price: 2400, stock: 180, description: 'Agua mineral natural nacida en la cordillera.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/28929791/Agua-Mineral-Natural-MANANTIAL-500-Mililitro-3014170_a.jpg?v=638859482465300000' },
        { name: 'Jugo Hit Naranja Piña 1L', price: 4300, stock: 90, description: 'Refresco de fruta pasteurizado.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/33585754/Bebida-Naranja-Pina-Tetra-16444_a.jpg?v=639158915244800000' },
        { name: 'Té Helado Mr. Tea Limón 1.5L', price: 4800, stock: 85, description: 'Té listo para tomar sabor a limón.', imageUrl: 'https://carulla.vtexassets.com/arquivos/ids/25199312/Mr-Tea-Limon-Cero-1051591_a.jpg?v=639154819521800000' }
      ]
    },
    {
      categoria: 'Carnes',
      productos: [
        { name: 'Pechuga de Pollo Fresca 1kg', price: 18900, stock: 50, description: 'Pechuga deshuesada de pollo fresco.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/711573-1200-auto?v=637741087518530000&width=1200&height=auto&aspect=true' },
        { name: 'Carne Molida de Res Premium 1kg', price: 27900, stock: 40, description: 'Carne molida seleccionada baja en grasa.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1478854-1200-auto?v=638602828536230000&width=1200&height=auto&aspect=true' },
        { name: 'Chatas de Res para Asar 1kg', price: 31900, stock: 30, description: 'Corte de res jugoso y tierno.', imageUrl: 'https://www.grupoggc.com/cdn/shop/files/30_720x@2x.jpg?v=1729700420' },
        { name: 'Lomo de Cerdo Fresco 1kg', price: 23900, stock: 35, description: 'Corte magro de cerdo seleccionado.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/715414-1200-auto?v=637756087466570000&width=1200&height=auto&aspect=true' },
        { name: 'Chorizo Santarrosano Zenú 500g', price: 13900, stock: 60, description: 'Chorizos tradicionales estilo santarrosano.', imageUrl: 'https://zenu.com.co/wp-content/uploads/2023/12/1080678-7701101362945_H1C1-1.png' }
      ]
    },
    {
      categoria: 'Congelados',
      productos: [
        { name: 'Papas a la Francesa McCain 1kg', price: 14500, stock: 40, description: 'Papas prefritas congeladas listas para preparar.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1460334-1200-auto?v=638556250246830000&width=1200&height=auto&aspect=true' },
        { name: 'Nuggets de Pollo Zenú 500g', price: 12900, stock: 50, description: 'Pechuga de pollo apanada.', imageUrl: 'https://zenu.com.co/wp-content/uploads/2023/12/DUMMIE-ZENU-NUGGETS-POLLO-APANADOS-512G-1-1.png' },
        { name: 'Verduras Mixtas Congeladas 500g', price: 6800, stock: 60, description: 'Zanahoria, alverja y habichuela.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1901263-1200-auto?v=638900222844170000&width=1200&height=auto&aspect=true' },
        { name: 'Helado Crem Helado Vainilla 1L', price: 13500, stock: 30, description: 'Helado cremoso tradicional.', imageUrl: 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/vaso-1-litro-vainilla-1.webp' },
        { name: 'Hamburguesas de Res Zenú (4 un)', price: 11200, stock: 45, description: 'Medallones de carne de res sazonados.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1595668-1200-auto?v=638678480874430000&width=1200&height=auto&aspect=true' }
      ]
    },
    {
      categoria: 'Cuidado Personal',
      productos: [
        { name: 'Crema Dental Colgate Triple Acción 150ml', price: 7900, stock: 110, description: 'Crema dental con flúor, protección tres en uno.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/33639936/Crema-Dental-Triple-Accion-X-150-ml-147120_a.jpg?v=639161798252970000' },
        { name: 'Shampoo Head & Shoulders Limpieza Renovadora 375ml', price: 18200, stock: 65, description: 'Shampoo anticaspa de uso diario.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/33472440/Shampoo-Limp-Reno-1368971_a.jpg?v=639149086414830000' },
        { name: 'Desodorante Speed Stick Clinical Active 50g', price: 12500, stock: 80, description: 'Antitranspirante clínico para máxima protección.', imageUrl: 'https://copservir.vtexassets.com/arquivos/ids/1884886-1200-auto?v=639109100785970000&width=1200&height=auto&aspect=true' },
        { name: 'Jabón Protex Avena Paquete x3', price: 11400, stock: 90, description: 'Jabón en barra antibacterial con avena.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/33640052/Jabon-Avena-Barra-X3-Unds-PROTEX-330-gr-3105415_a.jpg?v=639161800471730000' },
        { name: 'Papel Higiénico Familia Acolchamax 4 Rollos', price: 9800, stock: 100, description: 'Papel higiénico suave y absorbente.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1538065-1200-auto?v=638652881548230000&width=1200&height=auto&aspect=true' }
      ]
    },
    {
      categoria: 'Dulces y Chocolates',
      productos: [
        { name: 'Chocolatina Jet Tradicional', price: 800, stock: 200, description: 'La clásica chocolatina colombiana.', imageUrl: 'https://mecato.shop/cdn/shop/products/chocolatina-jet-8_1800x1800.jpg?v=1642798416' },
        { name: 'Galletas Festival Fresa (Taco)', price: 2500, stock: 150, description: 'Galletas rellenas con crema sabor fresa.', imageUrl: 'https://cnutresa.vtexassets.com/arquivos/ids/163960-1200-auto?v=638539743880730000&width=1200&height=auto&aspect=true' },
        { name: 'Barrilete (Display)', price: 1200, stock: 180, description: 'Goma masticable tricolor.', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6vFj4KDB0T3CSRHZmkl8M_iwmNa4EVBJIjg&s' },
        { name: 'Bom Bom Bum Fresa (Paquete x24)', price: 6500, stock: 80, description: 'Chupeta rellena de chicle.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1395272-1200-auto?v=638496779695300000&width=1200&height=auto&aspect=true' },
        { name: 'Trululu Aros (Gomitas 100g)', price: 2800, stock: 120, description: 'Gomitas azucaradas en forma de aros.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/32884539/Gomitas-TRULULU-AROS-FRUTAL-100-gr-3530908_a.jpg?v=639100473156400000' }
      ]
    },
    {
      categoria: 'Farmacia',
      productos: [
        { name: 'Dolex Forte (Caja x10)', price: 12500, stock: 100, description: 'Alivio para dolores fuertes.', imageUrl: 'https://copservir.vtexassets.com/arquivos/ids/1880746-1200-auto?v=639107981676730000&width=1200&height=auto&aspect=true' },
        { name: 'Advil Max (Caja x10)', price: 14200, stock: 90, description: 'Ibuprofeno líquido de rápida acción.', imageUrl: 'https://copservir.vtexassets.com/arquivos/ids/1881460-1200-auto?v=639108103570170000&width=1200&height=auto&aspect=true' },
        { name: 'Vitamina C Cebión (10 Tabletas)', price: 18500, stock: 60, description: 'Suplemento vitamínico efervescente.', imageUrl: 'https://beta1.cruzverde.com.co/on/demandware.static/-/Sites-masterCatalog_Colombia/default/dwec8f30d5/images/large/21575-1-CEBION-500MG-TAB-MAST-CAJ-X-100-NARANJA.jpg' },
        { name: 'Alcohol Antiséptico JGB 700ml', price: 6400, stock: 110, description: 'Desinfectante de uso externo.', imageUrl: 'https://copservir.vtexassets.com/arquivos/ids/1879421-1200-auto?v=639107784905370000&width=1200&height=auto&aspect=true' },
        { name: 'Curitas (Caja x20)', price: 3500, stock: 150, description: 'Bandas adhesivas para proteger heridas.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1500847-1200-auto?v=638640817224470000&width=1200&height=auto&aspect=true' }
      ]
    },
    {
      categoria: 'Frutas',
      productos: [
        { name: 'Banano Urabá 1kg', price: 3200, stock: 100, description: 'Bananos maduros dulces y frescos.', imageUrl: 'https://supertiendascomunal.com/2180-thickbox_default/banano-uraba-kilo.jpg' },
        { name: 'Manzana Roja Importada 1kg', price: 11900, stock: 50, description: 'Manzanas rojas crujientes y frescas.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/735538-1200-auto?v=638816193373530000&width=1200&height=auto&aspect=true' },
        { name: 'Piña Oro Miel Unidad', price: 5800, stock: 40, description: 'Piña dulce, jugosa y de excelente aroma.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/735069-1200-auto?v=637782311689230000&width=1200&height=auto&aspect=true' },
        { name: 'Lulo Fresco 1kg', price: 6900, stock: 60, description: 'Fruta ácida típica, ideal para jugos o lulada.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/735590-1200-auto?v=637782320898570000&width=1200&height=auto&aspect=true' },
        { name: 'Mango Tommy 1kg', price: 5500, stock: 80, description: 'Mango de pulpa firme y sabor dulce.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/735468-1200-auto?v=637782319752670000&width=1200&height=auto&aspect=true' }
      ]
    },
    {
      categoria: 'Hogar',
      productos: [
        { name: 'Pilas Alcalinas Duracell AA (Paquete x4)', price: 15900, stock: 80, description: 'Baterías de larga duración.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/2349483-1200-auto?v=639056592414570000&width=1200&height=auto&aspect=true' },
        { name: 'Foco LED Philips 9W', price: 8500, stock: 100, description: 'Bombillo luz blanca ahorrador.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/27507332/BULBO-LED-9W-800-LM-E27-3000K-PHILIPS-9290020462-1706592_a.jpg?v=638826837090430000' },
        { name: 'Fósforos El Rey (Paquete x10)', price: 2500, stock: 150, description: 'Fósforos clásicos de madera.', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7YJqmCvBtajMiu2JTKm9KxUKclqt6yCAzMg&s' },
        { name: 'Bolsas para Basura Negras Grandes (Paquete x10)', price: 5800, stock: 120, description: 'Bolsas muy resistentes.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/765460-1200-auto?v=637806412214130000&width=1200&height=auto&aspect=true' },
        { name: 'Papel Aluminio Reynolds 15m', price: 11200, stock: 70, description: 'Papel aluminio para conservar alimentos.', imageUrl: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQ8t-FxCeY0PI7rhVmKWcqW6eZZHXpgH_T-w5PBo7xbI3t4nCF_SxvYeU7ChnP9qF4kQVbFiRzHOzDVCJL7ncAkBmyS7NtdFy1_aCrgp_IB9-6C1D3fYuZn6A' }
      ]
    },
    {
      categoria: 'Lácteos',
      productos: [
        { name: 'Leche Entera Alquería 1L', price: 4900, stock: 150, description: 'Leche entera pasteurizada, sabor y nutrición.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/30798446/Leche-Entera-UHT-Super-Crem-Und-ALQUERIA-1000-ml-3473693_a.jpg?v=638932012354030000' },
        { name: 'Queso Doble Crema Colanta 500g', price: 15800, stock: 60, description: 'Queso semiblando para fundir, ideal para sándwich.', imageUrl: 'https://www.pidecolanta.com/images/thumbs/0000214_queso-doble-crema-colanta-bloque-x-500-g_550.png' },
        { name: 'Mantequilla con Sal Colanta 250g', price: 9200, stock: 90, description: 'Mantequilla de leche de vaca seleccionada.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1423172-1200-auto?v=638513002585900000&width=1200&height=auto&aspect=true' },
        { name: 'Yogurt Alpina Fresa 1L', price: 10900, stock: 70, description: 'Bebida láctea con trozos de fresa.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1424347-1200-auto?v=638786297154930000&width=1200&height=auto&aspect=true' },
        { name: 'Crema de Leche Colanta 200ml', price: 4200, stock: 110, description: 'Crema de leche de alta densidad para postres y salsas.', imageUrl: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTnNDzwZhKLM9DJpHESp4WujkN6JUp_S9Nzybx5GwBEcTc826EKbCKj-3HmGvs5dvb1AngMv0Pb7munFZd3jLqotcR2COP3Cc44XRC8aVKAaoP6jZ9sC5-O' }
      ]
    },
    {
      categoria: 'Limpieza',
      productos: [
        { name: 'Detergente Fab Flores Silvestres 3kg', price: 29800, stock: 40, description: 'Detergente en polvo multiusos para ropa blanca y color.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1161191-1200-auto?v=638320408536870000&width=1200&height=auto&aspect=true' },
        { name: 'Lavavajillas Axion Limón Líquido 500ml', price: 8300, stock: 75, description: 'Crema lavavajillas líquida con alto poder desengrasante.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/33449299/Lavaplatos-Liquido-Explosion-Citrica-AXION-61036198-3429326_a.jpg?v=639148777875430000' },
        { name: 'Cloro Blancox Desinfectante 1L', price: 4200, stock: 90, description: 'Desinfectante y blanqueador para el hogar.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/719295-1200-auto?v=637756138365430000&width=1200&height=auto&aspect=true' },
        { name: 'Suavizante Downy Concentrado 1L', price: 13900, stock: 50, description: 'Suavizante de telas con perfume de larga duración.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/33545497/MEJORADORES-DE-TEJID-NA-DOWNY-80350281-3011071_a.jpg?v=639154439780300000' },
        { name: 'Fabuloso Lavanda Limpiador de Pisos 1L', price: 5800, stock: 80, description: 'Limpiador líquido aromatizante para superficies.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1548700-1600-auto?v=638654003992870000&width=1600&height=auto&aspect=true' }
      ]
    },
    {
      categoria: 'Mascotas',
      productos: [
        { name: 'Alimento para Perro Dog Chow Adulto 2kg', price: 24500, stock: 50, description: 'Nutrición completa para perros adultos.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1470442-1200-auto?v=638577061287030000&width=1200&height=auto&aspect=true' },
        { name: 'Alimento para Gato Cat Chow Adulto 1.5kg', price: 21900, stock: 45, description: 'Alimento balanceado sabor pescado.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/32966947/Alimento-Para-Gatos-Cat-Chow-Activos-X-15-Kilos-117406_a.jpg?v=639111051932800000' },
        { name: 'Arena para Gatos 4kg', price: 14800, stock: 60, description: 'Arena aglomerante con control de olores.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/1306315-1200-auto?v=638437127275230000&width=1200&height=auto&aspect=true' },
        { name: 'Galletas Dogourmet 500g', price: 8500, stock: 70, description: 'Snacks horneados para perros.', imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQkABDp2p5lLuP7E-eb2wwPtCWGy8VrL6_rrxMZY3lso9gwRK9js4iGUKwvYd0omL7vC-r3P59eguzIeu2FCyl4qAXQKZIii__ZUoYcpX8hMcs5BDrx4hNjTA' },
        { name: 'Sobre Alimento Húmedo Felix Gato 85g', price: 3500, stock: 120, description: 'Trozos jugosos con atún.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/32966993/Alimento-Humedo-Carne-FELIX-85-gr-3208187_a.jpg?v=639111052127400000' }
      ]
    },
    {
      categoria: 'Panadería',
      productos: [
        { name: 'Pan Tajado Blanco Bimbo Grande', price: 8400, stock: 50, description: 'Pan tajado para sándwiches y desayunos.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/33498562/Pan-BIMBO-BLANCO-SUAVE-ESPONJOSO-730-gr-3663322_a.jpg?v=639153206539670000' },
        { name: 'Arepa de Maíz Blanco Promasa (5 und)', price: 3400, stock: 120, description: 'Arepa de maíz blanco tradicional sin sal.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/33676892/Arepas-Paisa-Paq-X-5-Unds-Cu-527486_a.jpg?v=639166193850570000' },
        { name: 'Tostadas Bimbo Integrales 250g', price: 6200, stock: 70, description: 'Tostadas crujientes de trigo integral.', imageUrl: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQO_yIEDGtaZ-GP9ifqsY--miVYIQuVFbIbIMhz5PMO-aE2AadK73c4Swpz0yJJ7-uCcgzpz7sACt6Td7M-EMW3hsgRppU1v39LWRNU0BfyUKw2OPCWHSQX' },
        { name: 'Ponqué Ramo Gala Vainilla', price: 2400, stock: 100, description: 'Torta tradicional sabor a vainilla.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/33380923/Gala-Tajada-Vainilla-RAMO-60-Gramo-1769083_a.jpg?v=639142188047300000' },
        { name: 'Achiras del Huila Ramo 100g', price: 4500, stock: 80, description: 'Bizcocho de achira tradicional colombiano.', imageUrl: 'https://exitocol.vteximg.com.br/arquivos/ids/22827790/ACHIRAS-RAMO-100-Gramo-178507_a.jpg?v=638513800208800000' }
      ]
    },
    {
      categoria: 'Pastas y Cereales',
      productos: [
        { name: 'Cereal Kellogg\'s Zucaritas 500g', price: 15400, stock: 60, description: 'Hojuelas de maíz escarchadas.', imageUrl: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcT7H6xyrqR8I9y_S3gBQcdWYvHKXjOPv0h6UBqqGFNxnMk0xhQIklsBktR-ZgoJS8URU1IZn5iZVLuyih82WClrg1KAhpD70be-RNRQUyi8q9kGBBloO3bU' },
        { name: 'Avena en Hojuelas Quaker 500g', price: 6800, stock: 90, description: 'Avena integral 100% natural.', imageUrl: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTrUlTf7e3NGAworCF32AVvaOw2zlopsYlIEReM_qMtZH2QKVV5LzWGjYObVkAc1t6zGUdYhVdPb0u4pJ-6BXAviY2udOHXgvTgqV7F75_Q6IldBVUqd4n-' },
        { name: 'Granola Tosh Frutos Rojos 300g', price: 9500, stock: 75, description: 'Mezcla crujiente con avena y frutas.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/29102547/Cereal-Frutos-Rojos-TOSH-300-gr-3366747_a.jpg?v=638881207472630000' },
        { name: 'Pasta Macarrones Doria 500g', price: 3800, stock: 110, description: 'Pasta corta enriquecida con vitaminas.', imageUrl: 'https://supertiendascomunal.com/6585-large_default/pasta-doria-macarron-500-g.jpg' },
        { name: 'Salsa de Tomate Fruco para Pasta 400g', price: 5200, stock: 85, description: 'Salsa lista con base de tomate y especias.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/31961259/Salsa-Tomate-Doypack-400-gr-287437_a.jpg?v=639003094500800000' }
      ]
    },
    {
      categoria: 'Pescados y Mariscos',
      productos: [
        { name: 'Atún Van Camp\'s Lomitos en Agua 160g', price: 7200, stock: 150, description: 'Atún premium bajo en grasa.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/2383054-1200-auto?v=639113605796130000&width=1200&height=auto&aspect=true' },
        { name: 'Atún Van Camp\'s Lomitos en Aceite 160g', price: 7200, stock: 150, description: 'Atún conservado en aceite de girasol.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/2383052-1200-auto?v=639113605633430000&width=1200&height=auto&aspect=true' },
        { name: 'Filete de Tilapia Congelado 500g', price: 16500, stock: 40, description: 'Filetes de pescado blanco limpios.', imageUrl: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQRNPAcPKE2XvdikksV1pwQUU6MVWMP4A_10o5u3BATMFvlMb8Jc8ftaZxqT7ItmUcrg9Ddwo5T1rqr6PY7q8M-iVzcnZlais3qpwrW5oJex9_E4DtlNOHp' },
        { name: 'Camarón Precocido Congelado 400g', price: 28900, stock: 30, description: 'Camarón pacotilla listo para preparar.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/711107-1200-auto?v=638807559418000000&width=1200&height=auto&aspect=true' },
        { name: 'Sardinas La Sirena en Tomate 425g', price: 5800, stock: 70, description: 'Sardinas enteras en salsa.', imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ98fjb4zsnLDz1lm9lyEoZbLXDfZm79Nuw6GDRpQqoj6OpMOf1WgDV1_CwatpIOArjyTA9_K9WNYlY84zkljvvs-r3faJRTk9HW7ebYDwreAUoe1qis7qo' }
      ]
    },
    {
      categoria: 'Quesos y Fiambres',
      productos: [
        { name: 'Jamón Pietrán Pechuga de Pavo 250g', price: 11500, stock: 80, description: 'Jamón premium bajo en grasa.', imageUrl: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ2aLUEFFUMw8IeQ3Df99y9yJ0yx2qR3AC0R-qWMZGpmYPpVk9uMDSXIpmqn_blmzrUolU6sTQK3Jy-_1tF2iKeU_iHBC_DU-iULF4zhIDC6CVQKLoAwWqh' },
        { name: 'Jamón Zenú Tradicional 250g', price: 8200, stock: 100, description: 'Jamón de cerdo tajado.', imageUrl: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSrns063pmn3qZCXAIdEVPRT_JmOwfvEwiywWM0943kxpZOXM8T4kU5EyjdxhfCXI90YslsssmKQFxPfpw75CCmtd3L0Uex4XMmKN-U2pTLpmdPJbfDKoSPwQ' },
        { name: 'Salchicha Ranchera (Paquete x6)', price: 9800, stock: 70, description: 'Salchicha de res y cerdo con sabor ahumado.', imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRUu-pGOjcDOKhxj1qonJ5uorZm2Klorgjj3Yu2Ic8ccou8jxvN4pkiG11DvzTukwp0oWmT00wuZ0IAl9jkohGVjDvcLAtVhKpmdYTJHlj4W1Q4CAglsTJN' },
        { name: 'Queso Mozzarella Colanta Tajado 250g', price: 9500, stock: 65, description: 'Queso madurado ideal para derretir.', imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSrm_4gpbSeQUQhHlYd0OTDRQdpaOW1q9IsktnaJP7sS8lmym7bziZn93XTk8WBkPcPrl31s-vkxiqTPUsPrv88iQZE_7V9Yx0VvddtxgpuzRhnEm8YLvn6' },
        { name: 'Tocineta Ahumada Zenú 200g', price: 12400, stock: 50, description: 'Tiras de tocino crujiente al cocinar.', imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQSVVZBd7-vVWlFWftquj9BJ3CKnB2m8ImbIuplf6Pqj_N-b6K_MHBN3VqwiKgirrBd8qiO2pRAQJtzsRsfgiIgWHAVF00VkyhmJQ_0c0q37d8QZc7EenYP6w' }
      ]
    },
    {
      categoria: 'Salsas y Aderezos',
      productos: [
        { name: 'Mayonesa Fruco 400g', price: 8500, stock: 90, description: 'Mayonesa tradicional colombiana.', imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSokKOwONR4ym_Fa_ou15wZ4N1UByehIl6rGITq7GP1-R_l5QTm4uiIKq2M4sCsLMurXbSL_V0JylaBCJqPJqlXLqqflBhPpg' },
        { name: 'Salsa de Tomate Fruco 400g', price: 7800, stock: 100, description: 'Ketchup elaborado con tomates frescos.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/31961259/Salsa-Tomate-Doypack-400-gr-287437_a.jpg?v=639003094500800000' },
        { name: 'Mostaza Fruco 250g', price: 4500, stock: 85, description: 'Mostaza amarilla clásica.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/31961213/Most-Doypack-200-gr-716517_a.jpg?v=639003093845470000' },
        { name: 'Salsa Rosada Fruco 250g', price: 5200, stock: 75, description: 'Mezcla suave ideal para acompañar.', imageUrl: 'https://product-images.farmatodo.com/s4N72RKt3VO7m-B--452YdCrtwauyctS1AdpKoJbK1ebs02vtdEkICSntqI0U6kEJopo7WON91h2xtvfIY3NSedtVQf-EFHLIjb3=s360' },
        { name: 'Salsa de Soya Aderezos 300ml', price: 6500, stock: 60, description: 'Salsa oriental tradicional.', imageUrl: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRDV7E4T212e5RLgAMSMSCGQoPJnKf8-m63Dv1QQ_S9jMBdr79leWVHFkClmNWs2i_cGwHfSSfQnc6VIXfXe0TgErD6-LCJjpw80z-Ro5f3zzoNHVmJUQeNag' }
      ]
    },
    {
      categoria: 'Snacks',
      productos: [
        { name: 'Papas Fritas Margarita Limón 110g', price: 4900, stock: 120, description: 'Papas fritas con sabor a limón y sal.', imageUrl: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRqjSh_SeDmhPzkDCJEPEJpHtSPa2ugygDeN4TCNH2kX0tOSCtxZZnN5XlZPETgHTbyDQHuHABNUbwtqjYwqgLRQMFA8RPTWMzWBGzcirTJGdB-6P0pyBMR7A' },
        { name: 'Choclitos Limón Ramo 150g', price: 3800, stock: 130, description: 'Snack horneado de maíz con limón.', imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQv9EjD0zl2MP-R90oooOAMhziyL3q7OQC4nqAUrL-Q3lMg1xCtsY3tybVzRqD_pydR6otEpDc_r7NUOtuJmfiAGISk_ntLXi34MFVghJNCLxkaOy3gBAgC' },
        { name: 'Tostacos Picantes Ramo 120g', price: 3500, stock: 110, description: 'Pasabocas de maíz crujiente sabor picante.', imageUrl: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQkmaUfN4Wv207VXv8mQEHA-7mtmX2q2Sed5wTQBzCC9SF2MSYGziSH40O4lBkgSuAcnRBd_QGK-6oxNtokbmKP-hdxWVZfEusC4hcsxOh2MtHvN5P0LwTZ' },
        { name: 'Maní Salado La Especial 150g', price: 6400, stock: 90, description: 'Maní tostado y salado para compartir.', imageUrl: 'https://cnutresa.vtexassets.com/arquivos/ids/160616-1200-auto?v=638129236912830000&width=1200&height=auto&aspect=true' },
        { name: 'Galletas Club Social Original (Paquete x6)', price: 5400, stock: 100, description: 'Galletas de sal ligeramente dulces y crujientes.', imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQPk2mbH1Gq3Nlq3aK_fzxmYwTnBpHPlYmFxjKfUVFrEpp_MxC0KVrdhVB5LmZZiQ5q6FT-2OxZ93_swvL9SNt4lS9kTObjc3yoMQm4dbO8JCEK6_rWEYnRsA8' }
      ]
    },
    {
      categoria: 'Verduras',
      productos: [
        { name: 'Tomate Chonto Fresco 1kg', price: 4500, stock: 90, description: 'Tomate rojo seleccionado para guisos y ensaladas.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/32665830/Tomate-Chonto-Frescampo-X-1000-gr-506130_a.jpg?v=639082473178570000' },
        { name: 'Cebolla Cabezona Blanca 1kg', price: 3600, stock: 100, description: 'Cebolla fresca de bulbo firme.', imageUrl: 'https://olimpica.vtexassets.com/arquivos/ids/865293-1200-auto?v=637908069989870000&width=1200&height=auto&aspect=true' },
        { name: 'Papa Criolla Seleccionada 1kg', price: 5200, stock: 110, description: 'Papa amarilla pequeña, típica colombiana.', imageUrl: 'https://exitocol.vtexassets.com/arquivos/ids/24439523/Papa-Criolla-1000g-1790_a.jpg?v=638609237962300000' },
        { name: 'Zanahoria Fresca 1kg', price: 2800, stock: 100, description: 'Zanahorias de tierra fría crujientes.', imageUrl: 'https://mercadomadrid.com.co/10989-superlarge_default_2x/zanahoria-kilo.jpg' },
        { name: 'Plátano Maduro 1kg', price: 4200, stock: 90, description: 'Plátanos amarillos ideales para freír o asar.', imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQdcoqoGSamVYpLYP5G154rR6Kij1AawHViV44QOYadMCvtryoDI37apx91KZCClrgmyRTaWWcdAZFzUdWfwBO9GANa32RmmrfgNmUXleAEO4P2kgSEdbn_' }
      ]
    }
  ];

  console.log('Inyectando categorías y productos...');
  for (const item of datosSemilla) {
    const categoriaCreada = await prisma.category.upsert({
      where: { name: item.categoria },
      update: {},
      create: { name: item.categoria },
    });

    for (const prod of item.productos) {
      await prisma.product.create({
        data: {
          name: prod.name,
          price: prod.price,
          stock: prod.stock,
          description: prod.description,
          imageUrl: prod.imageUrl,
          categoryId: categoriaCreada.id
        }
      });
    }
  }

  console.log('Categorías y productos inyectados correctamente.');
  console.log('Seeding completado con éxito. ¡Base de datos lista con 100 productos de Colombia!');
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });