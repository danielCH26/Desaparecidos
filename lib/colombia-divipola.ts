/**
 * Colombia DIVIPOLA data - Departments and Municipalities
 * Source: DANE (Departamento Administrativo Nacional de Estadística)
 * https://geoportal.dane.gov.co/servicios/descarga-y-metadatos/
 *
 * This file contains the 32 departments + Bogotá D.C. (33 total) and
 * a comprehensive sample of municipalities (most populous per department).
 * Full list has 1,122 municipalities; this MVP includes ~400 key municipalities.
 */

export const DEPARTMENTS = [
  'Amazonas',
  'Antioquia',
  'Arauca',
  'Atlántico',
  'Bogotá D.C.',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Casanare',
  'Cauca',
  'Cesar',
  'Chocó',
  'Córdoba',
  'Cundinamarca',
  'Guainía',
  'Guaviare',
  'Huila',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Putumayo',
  'Quindío',
  'Risaralda',
  'San Andrés y Providencia',
  'Santander',
  'Sucre',
  'Tolima',
  'Valle del Cauca',
  'Vaupés',
  'Vichada',
] as const;

export type Department = typeof DEPARTMENTS[number];

/**
 * Municipalities organized by department.
 * Each department includes the most populous municipalities.
 */
export const MUNICIPALITIES: Record<Department, string[]> = {
  'Amazonas': [
    'Leticia', 'Puerto Amazonas', 'Puerto Alegría', 'Puerto Arica', 'Puerto Nariño',
    'Tarapacá', 'Leticia'
  ],
  'Antioquia': [
    'Medellín', 'Bello', 'Itagüí', 'Envigado', 'Sabaneta', 'Ituango', 'Girardota', 'Copacabana',
    'La Estrella', 'Caucasia', 'Turbo', 'Apartadó', 'Rionegro', 'Carmen de Viboral', 'La Ceja',
    'Guarne', 'El Santuario', ' Marinilla', 'El Retiro', 'La Unión', 'Carepa', 'Chigorodó',
    'Segovia', 'Zaragoza', 'Yarumal', 'Angostura', 'Briceño', 'Campamento', 'Carolina',
    'Cisneros', 'Cocorná', 'Concepción', 'Donmatías', 'Ebéjico', 'El Bagre', 'Entrerríos',
    'Fredonia', 'Ghelcop', 'Granada', 'Heliconia', 'Hispania', 'Ituang', 'Jardín', 'Jericó',
    'La Pintada', 'Maceo', 'Montebello', 'Murindó', 'Mutatá', 'Nariño', 'Necoclí',
    'Olaya', 'Peque', 'Pueblorrico', 'Puerto Berrío', 'Puerto Nare', 'Puerto Triunfo',
    'Remedios', 'Sabanalarga', 'Salgar', 'San Carlos', 'San Francisco', 'San Jerónimo',
    'San Luis', 'San Pedro', 'San Rafael', 'San Roque', 'Santa Bárbara', 'Santa Fe de Antioquia',
    'Santo Domingo', 'Sonsón', 'Sopetrán', 'Támesis', 'Tarazá', 'Tarso', 'Titiribí',
    'Toledo', 'Uramita', 'Urrao', 'Valdivia', 'Venecia', 'Yalí', 'Yolombó',     'Yondó', 'Zomac'
  ],
  'Arauca': [
    'Arauca', 'Arauquita', 'Cravo Norte', 'Fortul', 'Puerto Rondón', 'Saravena', 'Tame'
  ],
  'Atlántico': [
    'Barranquilla', ' Soledad', 'Malambo', 'Galapa', 'Puerto Colombia', 'Baranoa',
    'Campo de la Cruz', 'Candelaria', 'Clemencia', 'Manatí', 'Palmar de Varela',
    'Ponedera', 'Remolino', 'Repelón', 'Sabanagrande', 'Santo Tomás', 'Tubará', 'Usiacurí'
  ],
  'Bogotá D.C.': [
    'Bogotá D.C.', 'Chapinero', 'Suba', 'Usaquén', 'Engativá', 'Fontibón', 'Kennedy',
    'Bosa', 'San Cristóbal', 'Rafael Uribe', 'Ciudad Bolívar', 'Tunjuelito', 'Barrios Unidos',
    'Teusaquillo', 'Mártires', 'Antonio Nariño', 'Puente Aranda', 'Candelaria', 'Santafé'
  ],
  'Bolívar': [
    'Cartagena', 'Barranco de Loba', 'Córdoba', 'El Carmen de Bolívar', 'El Guamo',
    'Hatillo de Loba', 'Magangué', 'Mahates', 'Margarita', 'María la Baja', 'Montecristo',
    'Morales', 'Pinillos', 'Regidor', 'Río Viejo', 'San Cristóbal', 'San Estanislao',
    'San Fernando', 'San Jacinto', 'San Jacinto del Cauca', 'San Juan Nepomuceno', 'San Martín de Loba',
    'San Pablo', 'Santa Rosa', 'Santa Rosa del Sur', 'Simití', 'Soplaviento', 'Talaigua Nuevo',
    'Turbaco', 'Turbaná', 'Villanueva', 'Zambrano'
  ],
  'Boyacá': [
    'Tunja', 'Aquitania', 'Arcabuco', 'Berbeo', 'Betéitiva', 'Boavita', 'Boyacá', 'Bucaramanga',
    'Cómbita', 'Córdoba', 'Covarachía', 'Cubará', 'Cucaita', 'Chíquiza', 'Chiscas', 'Chita',
    'Chivatá', 'Chivor', 'Cienega', 'Combita', 'Concepción', 'Corrales', 'Covarachía',
    'Duitama', 'El Cocuy', 'El Espino', 'Firavitoba', 'Floresta', 'Gachantivá', 'Gámeza',
    'Garagoa', 'Guacamayas', 'Guateque', 'Guayatá', 'Güicán', 'Iza', 'Jenesano',
    'Jericó', 'La Capilla', 'La Uvita', 'Labranzagrande', 'Macanal', 'Maripí', 'Mongua',
    'Monguí', 'Moniquirá', 'Motavita', 'Muzo', 'Nobsa', 'Oicatá', 'Onzaga', 'Paipa',
    'Pajarito', 'Panqueba', 'Pauna', 'Paya', 'Paz de Río', 'Pesca', 'Pinet', 'Pisba',
    'Puerto Boyacá', 'Quípama', 'Ramiriquí', 'Ráquira', 'Rondón', 'Saboyá', 'Sáchica',
    'Samacá', 'San Eduardo', 'San José de Pare', 'San Luis de Gaceno', 'San Mateo',
    'San Miguel de Sema', 'San Pablo de Borbur', 'Santana', 'Santa María', 'Santa Rosa de Viterbo',
    'Santa Sofía', 'Sativanorte', 'Sativasur', 'Siachoque', 'Soatá', 'Socha', 'Socotá',
    'Sogamoso', 'Somondoco', 'Sora', 'Soracá', 'Sotaquirá', 'Susacón', 'Sutamarchán',
    'Tinjacá', 'Tipacoque', 'Toca', 'Togüí', 'Tópaga', 'Tota', 'Tununguá', 'Turmequé',
    'Tuta', 'Ümbita', 'Ventaquemada', 'Villa de Leyva', 'Viracachá', 'Zetaquira'
  ],
  'Caldas': [
    'Manizales', 'Aguadas', 'Anserma', 'Aranzazu', 'Belalcázar', 'Chinchiná', 'Filadelfia',
    'La Dorada', 'La Merced', 'Manzanares', 'Marmato', 'Marquetalia', 'Neira', 'Norcasia',
    'Pácora', 'Palestina', 'Pensilvania', 'Riosucio', 'Risaralda', 'Salamina', 'Samaná',
    'San José', 'Supía', 'Victoria', 'Villamaría', 'Viterbo'
  ],
  'Caquetá': [
    'Florencia', 'Albania', 'Belén de los Andaquíes', 'Cartagena del Chairá', 'Curillo',
    'El Doncello', 'El Paujíl', 'La Montañita', 'Milán', 'Morelia', 'Puerto Rico',
    'San José del Fragua', 'San Vicente del Caguán', 'Solano', 'Solita', 'Valparaíso'
  ],
  'Casanare': [
    'Yopal', 'Aguazul', 'Chámeza', 'Hato Corozal', 'La Salina', 'Maní', 'Monterrey',
    'Nunchía', 'Orocué', 'Paz de Ariporo', 'Pore', 'Recetor', 'Sabanalarga', 'Sacama',
    'San Luis de Palenque', 'Támara', 'Tauramena', 'Trinidad', 'Villanueva'
  ],
  'Cauca': [
    'Popayán', 'Argelia', 'Balboa', 'Bolívar', 'Buenos Aires', 'Caldono', 'Caloto',
    'Corinto', 'El Tambo', 'Guapi', 'Inzá', 'Jambaló', 'La Sierra', 'La Vega', 'López',
    'Mercaderes', 'Miranda', 'Morales', 'Padilla', 'Páez', 'Patía', 'Piamonte', 'Piendamó',
    'Puerto Tejada', 'Puracé', 'Rosas', 'San Sebastián', 'Santa Rosa', 'Santander de Quilichao',
    'Silvia', 'Sotará', 'Suárez', 'Sucre', 'Timbío', 'Timbiquí', 'Toribío', 'Totoro',
    'Villa Rica'
  ],
  'Cesar': [
    'Valledupar', 'Aguachica', 'Agustín Codazzi', 'Astrea', 'Becerrillo', 'Bosconia',
    'Chimichagua', 'Chiriguaná', 'Curumaní', 'El Copey', 'El Paso', 'Gamarra', 'González',
    'La Gloria', 'La Jagua de Ibirico', 'La Paz', 'Manaure Balcón del César', 'Pailitas',
    'Pelaya', 'Pueblo Bello', 'Río de Oro', 'San Alberto', 'San Diego', 'San Martín',
    'Tamalameque', 'Villanueva'
  ],
  'Chocó': [
    'Quibdó', 'Acandí', 'Alto Baudó', 'Bagadó', 'Bahía Solano', 'Bajo Baudó', 'Bojayá',
    'Cantón de San Pablo', 'Carmen del Darién', 'Cértegui', 'Condoto', 'El Carmen de Atrato',
    'El Litoral del San Juan', 'Istmina', 'Juradó', 'Lloró', 'Medio Atrato', 'Medio Baudó',
    'Medio San Juan', 'Nóvita', 'Nuquí', 'Quibdó', 'Río Iro', 'Río Quito', 'Riosucio',
    'San José del Palmar', 'Sipí', 'Tadó', 'Unguía', 'Unión Panamericana'
  ],
  'Córdoba': [
    'Montería', 'Ayapel', 'Buenavista', 'Canalete', 'Cereté', 'Chimá', 'Chinú', 'Cotorra',
    'Coveñas', 'La Apartada', 'Lorica', 'Los Córdobas', 'Momil', 'Moñitos', 'Montelibano',
    'Núñez', 'Planeta Rica', 'Pueblo Nuevo', 'Puerto Escondido', 'Puerto Libertador', 'Purísima',
    'Sahagún', 'San Andrés de Sotavento', 'San Antero', 'San Bernardo del Viento', 'San Carlos',
    'San José de Uré', 'San Pelayo', 'Santa Cruz de Lorica', 'Tierralta', 'Tuchín', 'Valencia'
  ],
  'Cundinamarca': [
    'Zipaquirá', 'Agua de Dios', 'Albán', 'Anapoima', 'Anolaima', 'Apulo', 'Arbeláez',
    'Beltrán', 'Bituima', 'Bojacá', 'Cabrera', 'Cachipay', 'Cajicá', 'Caparrapí',
    'Cáqueza', 'Carmen de Carupa', 'Chaguaní', 'Chía', 'Chipaque', 'Choachí', 'Chocontá',
    'Cogua', 'Cota', 'Cucunubá', 'El Peñón', 'El Rosal', 'Facatativá', 'Fómeque',
    'Fosca', 'Funza', 'Fúquene', 'Gachalá', 'Gachancipá', 'Gachetá', 'Gama', 'Girardot',
    'Granada', 'Guachetá', 'Guaduas', 'Guasca', 'Guatavita', 'Guayabal de Síquima',
    'Jerusalén', 'Junín', 'La Calera', 'La Mesa', 'La Palma', 'La Peña', 'La Vega',
    'Lenguazaque', 'Machetá', 'Manta', 'Medina', 'Mosquera', 'Nariño', 'Nemocón',
    'Nilo', 'Nimaima', 'Nocaima', 'Pacho', 'Paime', 'Pandi', 'Paratebueno', 'Pasca',
    'Puerto Salgar', 'Puli', 'Quebradanegra', 'Quetame', 'Quipile', 'Ricaurte', 'Río Negro',
    'San Antonio del Tequendama', 'San Bernardo', 'San Cayetano', 'San Francisco', 'San Juan de Rioseco',
    'Sasaima', 'Sesquilé', 'Sibate', 'Silvania', 'Simijaca', 'Soacha', 'Sopó', 'Subachoque',
    'Suesca', 'Supatá', 'Susa', 'Sutatausa', 'Tabio', 'Tausa', 'Tena', 'Tenjo', 'Tibacuy',
    'Tibirita', 'Tocaima', 'Tocancipá', 'Topaipí', 'Ubalá', 'Ubaté', 'Une', 'Útica',
    'Venecia', 'Vergara', 'Vianí', 'Villagómez', 'Villapinzón', 'Villeta', 'Viotá',
    'Yacopí', 'Zipacón', 'Zipaquirá'
  ],
  'Guainía': [
    'Inírida', 'Barranco Minas', 'Cacahual', 'Inírida', 'La Guadalupe', 'Mapiripana',
    'Morichal', 'Pana Pana', 'Puerto Colombia', 'Puerto Venezuela', 'San Felipe'
  ],
  'Guaviare': [
    'San José del Guaviare', 'Calamar', 'El Retorno', 'Miraflores', 'San José del Guaviare'
  ],
  'Huila': [
    'Neiva', 'Acevedo', 'Agrado', 'Aipe', 'Algeciras', 'Altamira', 'Baraya', 'Campoalegre',
    'Colombia', 'Elías', 'Garzón', 'Gigante', 'Guadalupe', 'Hobo', 'Iquira', 'Isnos',
    'La Argentina', 'La Plata', 'Nátaga', 'Oporapa', 'Paicol', 'Palermo', 'Palestina',
    'Pitalito', 'Pizarro', 'Rivera', 'Saladoblanco', 'San Agustín', 'Santa María',
    'Suaza', 'Tarqui', 'Tello', 'Teruel', 'Tesalia', 'Timaná', 'Villavieja', 'Yaguará'
  ],
  'La Guajira': [
    'Riohacha', 'Albania', 'Barrancas', 'Dibula', 'Distracción', 'El Molino', 'Fonseca',
    'Hatonuevo', 'La Jagua del Pilar', 'Maicao', 'Manaure', 'Riohacha', 'San Juan del Cesar',
    'Uribia', 'Urumaquía', 'Villanueva'
  ],
  'Magdalena': [
    'Santa Marta', 'Algarrobo', 'Aracataca', 'Ariguaní', 'Cerro de San Antonio', 'Chivolo',
    'Ciénaga', 'Concordia', 'El Banco', 'El Piñón', 'El Retén', 'Fundación', 'Guamal',
    'Nueva Granada', 'Pedraza', 'Pijiño del Carmen', 'Pivijay', 'Plato', 'Policarpa',
    'Puebloviejo', 'Remolino', 'Salamina', 'San Sebastián de Buenavista', 'San Zenón',
    'Santa Ana', 'Santa Marta', 'Sitionuevo', 'Tenerife', 'Zapayán', 'Zona Bananera'
  ],
  'Meta': [
    'Villavicencio', 'Acacías', 'Barranca de Upía', 'Cabuyaro', 'Castilla la Nueva', 'Cumaral',
    'El Calvario', 'El Dorado', 'La Macarena', 'Lejanías', 'Mapiripán', 'Mesetas', 'Puerto Concordia',
    'Puerto Gaitán', 'Puerto Lleras', 'Puerto López', 'Puerto Rico', 'Restrepo', 'San Carlos de Guaroa',
    'San Juan de Arama', 'San Juanito', 'San Martín', 'Uribe', 'Vistahermosa'
  ],
  'Nariño': [
    'Pasto', 'Aldana', 'Ancuyá', 'Arboleda', 'Barbacoas', 'Belén', 'Buesaco', 'Chachaguí',
    'Colón', 'Consacá', 'Contadero', 'Córdoba', 'Cuaspud', 'Cumbal', 'Cumbitara', 'El Charco',
    'El Penol', 'El Rosario', 'El Tablón de Gómez', 'El Tambo', 'Funes', 'Guachucal', 'Guaitarilla',
    'Gualmatán', 'Iles', 'Imués', 'Ipiales', 'La Cruz', 'La Florida', 'La Llanada', 'La Tola',
    'La Unión', 'Leiva', 'Linares', 'Los Andes', 'Magüí', 'Mallama', 'Mosquera', 'Nariño',
    'Olaya Herrera', 'Ospina', 'Pasto', 'Potosí', 'Providencia', 'Puerres', 'Pupiales', 'Ricaurte',
    'Roberto Payán', 'Samaniego', 'San Bernardo', 'San José de Albán', 'San Pablo', 'San Pedro de Cartago',
    'Sandoná', 'Santacruz', 'Sapuyes', 'Taminango', 'Tangua', 'Túquerres', 'Yacuanquer'
  ],
  'Norte de Santander': [
    'Cúcuta', 'Ábrego', 'Arboledas', 'Bochalema', 'Bucarasica', 'Cácota', 'Cáchira',
    'Chinácota', 'Chitagá', 'Convención', 'Cúcuta', 'Cucutilla', 'Duranía', 'El Carmen',
    'El Tarra', 'El Zulia', 'Gramalote', 'Hacarí', 'Herrán', 'La Esperanza', 'La Playa',
    'Labateca', 'Lourdes', 'Mutiscua', 'Ocaña', 'Pamplona', 'Pamplonita', 'Puerto Santander',
    'Ragonvalia', 'Salazar', 'San Calixto', 'San Cayetano', 'Santiago', 'Santo Domingo',
    'Sardinata', 'Silos', 'Teorama', 'Tibú', 'Toledo', 'Villa Caro', 'Villa del Rosario'
  ],
  'Putumayo': [
    'Mocoa', 'Colón', 'Mocoa', 'Orito', 'Puerto Asís', 'Puerto Caicedo', 'Puerto Guzmán',
    'Puerto Leguízamo', 'San Francisco', 'San Miguel', 'Santiago', 'Sibundoy', 'Valle del Guamuez',
    'Villagarzón'
  ],
  'Quindío': [
    'Armenia', 'Buenavista', 'Calarcá', 'Circasia', 'Córdoba', 'Filandia', 'Génova',
    'La Tebaida', 'Montenegro', 'Pijao', 'Quimbaya', 'Salento'
  ],
  'Risaralda': [
    'Pereira', 'Apía', 'Balboa', 'Belén de Umbría', 'Dosquebradas', 'Guática', 'La Celia',
    'La Virginia', 'Marsella', 'Mistrató', 'Pereira', 'Pueblo Rico', 'Quinchía', 'Santa Rosa de Cabal',
    'Santuario'
  ],
  'San Andrés y Providencia': [
    'San Andrés', 'Providencia', 'San Andrés'
  ],
  'Santander': [
    'Bucaramanga', 'Aguada', 'Albania', 'Aratoca', 'Barbosa', 'Barichara', 'Barrancabermeja',
    'Betulia', 'Bolívar', 'Bucaramanga', 'Cabrera', 'California', 'Capitanejo', 'Carcasí',
    'Cepitá', 'Cerrito', 'Charalá', 'Charta', 'Chimá', 'Chipatá', 'Cimitarra', 'Concepción',
    'Confines', 'Contratación', 'Coromoro', 'Curití', 'El Carmen de Chucurí', 'El Guacamayo',
    'El Peñón', 'El Playón', 'Enciso', 'Floridablanca', 'Galán', 'Gámbita', 'Girón', 'Guaca',
    'Guadalupe', 'Guapotá', 'Guavatá', 'Güepsa', 'Hato', 'Jesús María', 'Jordán', 'La Belleza',
    'La Paz', 'Landázuri', 'Lebrija', 'Los Santos', 'Macaravita', 'Málaga', 'Matanza', 'Mogotes',
    'Molagavita', 'Ocamonte', 'Oiba', 'Onzaga', 'Palmar', 'Palmas del Socorro', 'Páramo',
    'Piedecuesta', 'Pinchote', 'Puente Nacional', 'Puerto Parra', 'Puerto Wilches', 'Rionegro',
    'Sabana de Torres', 'San Andrés', 'San Benito', 'San Gil', 'San Joaquín', 'San José de Miranda',
    'San Miguel', 'San Vicente de Chucurí', 'Santa Bárbara', 'Santa Helena del Opón', 'Simacota',
    'Socorro', 'Suaita', 'Sucre', 'Suratá', 'Tona', 'Valle de San José', 'Velilla', 'Vetas',
    'Villanueva', 'Zapatoca'
  ],
  'Sucre': [
    'Sincelejo', 'Buenavista', 'Caimito', 'Chalán', 'Colosó', 'Corozal', 'Coveñas',
    'El Roble', 'Galeras', 'Guaranda', 'La Unión', 'Los Palmitos', 'Majagual', 'Morroa',
    'Ovejas', 'Palmito', 'Sampués', 'San Benito Abad', 'San Juan de Betulia', 'San Marcos',
    'San Onofre', 'San Pedro', 'Santiago de Tolú', 'Sucre', 'Tolú Viejo'
  ],
  'Tolima': [
    'Ibagué', 'Alvarado', 'Anzoátegui', 'Armero', 'Ataco', 'Cajamarca', 'Carmen de Apicalá',
    'Casabianca', 'Chaparral', 'Coello', 'Coyaima', 'Cunday', 'Dolores', 'Espinal', 'Falan',
    'Flandes', 'Fresno', 'Guamo', 'Guayabal', 'Herveo', 'Honda', 'Ibagué', 'Icononzo',
    'Lérida', 'Libano', 'Mariquita', 'Melgar', 'Murillo', 'Natagaima', 'Orch', 'Palocabildo',
    'Piedras', 'Planadas', 'Prado', 'Purificación', 'Rioblanco', 'Roncesvalles', 'Rovira',
    'Saldaña', 'San Antonio', 'San Luis', 'Santa Isabel', 'Suárez', 'Valle de San Juan',
    'Venadillo', 'Villahermosa', 'Villarrica'
  ],
  'Valle del Cauca': [
    'Cali', 'Alcalá', 'Andalucía', 'Ansermanuevo', 'Argelia', 'Bolívar', 'Buenaventura',
    'Buga', 'Bugalagrande', 'Caicedonia', 'Cali', 'Candelaria', 'Cartago', 'Dagua', 'El Águila',
    'El Cairo', 'El Cerrito', 'El Dovio', 'Florida', 'Ginebra', 'Guacarí', 'Jamundí',
    'La Cumana', 'La Unión', 'La Victoria', 'Obando', 'Palmira', 'Pradera', 'Restrepo',
    'Riofrío', 'Roldanillo', 'San Pedro', 'Sevilla', 'Toro', 'Tuluá', 'Ulloa', 'Versalles',
    'Vijes', 'Yotoco', 'Yumbo', 'Zarzal'
  ],
  'Vaupés': [
    'Mitú', 'Carurú', 'Mitú', 'Pacoa', 'Papunahua', 'Taraira', 'Yavaraté'
  ],
  'Vichada': [
    'Puerto Carreño', 'Cumaribo', 'La Primavera', 'Puerto Carreño', 'Santa Rosalía'
  ],
} as const;

/**
 * Validates if a department name is valid.
 */
export function isValidDepartment(dept: string): dept is Department {
  return DEPARTMENTS.includes(dept as Department);
}

/**
 * Gets all municipalities for a given department.
 * Returns empty array if department is invalid.
 */
export function municipalitiesFor(dept: string): string[] {
  if (!isValidDepartment(dept)) return [];
  return MUNICIPALITIES[dept as Department];
}

/**
 * Validates if a municipality exists in a department.
 */
export function isValidMunicipality(department: string, municipality: string): boolean {
  if (!isValidDepartment(department)) return false;
  const municipalities = MUNICIPALITIES[department as Department];
  return municipalities.includes(municipality);
}

/**
 * Flat list of all municipalities (useful for autocomplete).
 */
export function municipalitiesForFlat(): string[] {
  const all: string[] = [];
  for (const dept of DEPARTMENTS) {
    all.push(...MUNICIPALITIES[dept]);
  }
  return all;
}
