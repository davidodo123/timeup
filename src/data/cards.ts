import type { Card, Category, CategoryId } from '../game/types';

export const CATEGORIES: Category[] = [
  { id: 'historicos', name: 'Personajes históricos' },
  { id: 'peliculas', name: 'Películas y series' },
  { id: 'animales', name: 'Animales' },
  { id: 'famosos', name: 'Famosos y ficción' },
  { id: 'objetos', name: 'Objetos' },
  { id: 'lugares', name: 'Lugares' },
];

const WORDS: Record<CategoryId, string[]> = {
  historicos: [
    'Cleopatra', 'Julio César', 'Napoleón', 'Cristóbal Colón', 'Leonardo da Vinci',
    'Juana de Arco', 'Albert Einstein', 'Marie Curie', 'Gandhi', 'Abraham Lincoln',
    'Isabel la Católica', 'Miguel de Cervantes', 'Frida Kahlo', 'Pablo Picasso', 'Mozart',
    'Beethoven', 'Charles Darwin', 'Isaac Newton', 'Galileo Galilei', 'Alejandro Magno',
    'Gengis Kan', 'Martin Luther King', 'Nelson Mandela', 'Simón Bolívar', 'Hernán Cortés',
    'Marco Polo', 'Shakespeare', 'Aristóteles', 'Sócrates', 'Tutankamón',
    'Nikola Tesla', 'Ada Lovelace', 'Neil Armstrong', 'Che Guevara', 'Winston Churchill',
    'Reina Victoria', 'Atila', 'Carlomagno', 'Salvador Dalí', 'Coco Chanel',
  ],
  peliculas: [
    'Titanic', 'Star Wars', 'El Rey León', 'Harry Potter', 'Jurassic Park',
    'El Padrino', 'Matrix', 'Toy Story', 'Frozen', 'Los Goonies',
    'Regreso al futuro', 'E.T.', 'Indiana Jones', 'Shrek', 'Buscando a Nemo',
    'Juego de Tronos', 'Los Simpson', 'Friends', 'La casa de papel', 'Stranger Things',
    'El señor de los anillos', 'Piratas del Caribe', 'Avatar', 'Rocky', 'Gladiator',
    'Mary Poppins', 'Los Vengadores', 'Batman', 'Spider-Man', 'Pulp Fiction',
    'Forrest Gump', 'El exorcista', 'Coco', 'Up', 'Breaking Bad',
    'Los Pitufos', 'Barbie', 'Mamma Mia', 'Grease', 'King Kong',
  ],
  animales: [
    'Elefante', 'Jirafa', 'Pingüino', 'Canguro', 'Pulpo',
    'Cocodrilo', 'Mariposa', 'Camaleón', 'Murciélago', 'Tiburón',
    'Koala', 'Perezoso', 'Flamenco', 'Búho', 'Gallina',
    'Serpiente', 'Caracol', 'Tortuga', 'Delfín', 'Ballena',
    'Mono', 'Gorila', 'León', 'Tigre', 'Cebra',
    'Hipopótamo', 'Rinoceronte', 'Avestruz', 'Pavo real', 'Erizo',
    'Ardilla', 'Castor', 'Mofeta', 'Medusa', 'Cangrejo',
    'Hormiga', 'Abeja', 'Mosquito', 'Rana', 'Camello',
  ],
  famosos: [
    'Shakira', 'Rafa Nadal', 'Messi', 'Cristiano Ronaldo', 'Michael Jackson',
    'Madonna', 'Elvis Presley', 'Freddie Mercury', 'Lady Gaga', 'Rosalía',
    'Bad Bunny', 'Taylor Swift', 'Beyoncé', 'Charlie Chaplin', 'Marilyn Monroe',
    'Mickey Mouse', 'Bob Esponja', 'Pikachu', 'Super Mario', 'Sherlock Holmes',
    'Drácula', 'Frankenstein', 'Caperucita Roja', 'Pinocho', 'Peter Pan',
    'Don Quijote', 'Tarzán', 'Superman', 'Wonder Woman', 'Darth Vader',
    'Papá Noel', 'Ratoncito Pérez', 'Mafalda', 'Mortadelo', 'Astérix',
    'Homer Simpson', 'Lara Croft','James Bond', 'Usain Bolt', 'Pau Gasol',
  ],
  objetos: [
    'Paraguas', 'Tostadora', 'Cepillo de dientes', 'Lavadora', 'Bicicleta',
    'Guitarra', 'Martillo', 'Tijeras', 'Escoba', 'Sacacorchos',
    'Microondas', 'Prismáticos', 'Brújula', 'Reloj de arena', 'Linterna',
    'Secador de pelo', 'Patines', 'Cometa', 'Globo', 'Hamaca',
    'Ventilador', 'Batidora', 'Grapadora', 'Mando a distancia', 'Calcetín',
    'Gafas de sol', 'Pinza de la ropa', 'Ataúd', 'Trompeta', 'Peluca',
    'Saxofón', 'Ancla', 'Telescopio', 'Muleta', 'Chupete',
    'Tobogán', 'Espejo', 'Llave inglesa', 'Sombrero de copa', 'Monopatín',
  ],
  lugares: [
    'Torre Eiffel', 'Pirámides de Egipto', 'Estatua de la Libertad', 'Gran Muralla China', 'Coliseo',
    'Sagrada Familia', 'Machu Picchu', 'Big Ben', 'Torre de Pisa', 'Alhambra',
    'Polo Norte', 'Desierto del Sahara', 'Amazonas', 'Monte Everest', 'Las Vegas',
    'Hollywood', 'Venecia', 'Disneyland', 'Hawái', 'Australia',
    'Japón', 'Aeropuerto', 'Hospital', 'Biblioteca', 'Discoteca',
    'Gimnasio', 'Zoo', 'Cementerio', 'Peluquería', 'Supermercado',
    'Playa', 'Cárcel', 'Circo', 'Estación espacial', 'Iglú',
    'Castillo', 'Selva', 'Volcán', 'Isla desierta', 'Parque de atracciones',
  ],
};

export const CARD_LIBRARY: Card[] = (Object.keys(WORDS) as CategoryId[]).flatMap((category) =>
  WORDS[category].map((text, i) => ({ id: `${category}-${i}`, text, category })),
);
