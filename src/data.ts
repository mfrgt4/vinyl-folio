export interface Vinyl { id:string; title:string; cat:string; year:number; color:string; cover?:string; audio?:string; desc:string; tools:string[] }
export interface Song { id:string; title:string; artist:string; dur:string; color:string; src?:string; link?:string; by?:string; status:'ok'|'pending' }
export interface Post { a:string; t:string; d:string }
export interface Thread { id:string; title:string; author:string; cat:string; date:string; posts:Post[] }
export const CATS = ['All','General','Music','Cinema','Gaming','Random']
const S = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-'

// "cat" = artistes · "tools" = genres
// "cover" = image dans public/covers/ · "audio" = fichier dans public/audios/ (les deux sont facultatifs)
export const VINYLS: Vinyl[] = [
 {id:'v1',title:'Know My Name',cat:'SOYEON, Vic Mensa, Sofía Reyes, Coco Jones',year:2026,color:'#9D5ACB',
  cover:'/covers/Know-My-Name.jpeg',
  audio:'/audios/Know-My-Name.mp3',
  desc:'Un titre que je réécoute en boucle. Quatre voix, quatre univers qui se répondent avec énergie pop constante. Les artistes se répondent comme une vraie rencontre plutôt qu’un simple featuring.',
  tools:['K-pop','Electro']},
 {id:'v2',title:'Titre 2',cat:'Artiste 2',year:2025,color:'#D2D1CC',desc:'Votre texte.',tools:['Pop']},
 {id:'v3',title:'Watch Me',cat:'Sophie Powers, Mimi Webb',year:2026,color:'#9B0545',
  cover:'/covers/Watch-Me.jpeg',
  audio:'/audios/Watch-Me.mp3',
  desc:'Un titre qui claque dès les premières secondes. Cette musique dégage un flow grâce à son refrain qui reste en tête. Ce que j’aime ici, c’est l’attitude et le côté show, comme si le morceau était pensé pour la scène.',
  tools:['K-pop','Pop', 'Electro']},
 {id:'v4',title:'Titre 4',cat:'Artiste 4',year:2023,color:'#D2D1CC',desc:'Votre texte.',tools:['Jazz']},
 {id:'v5',title:'Titre 5',cat:'Artiste 5',year:2022,color:'#D2D1CC',desc:'Votre texte.',tools:['Electro']}]

export const SONGS: Song[] = [
 {id:'s1',title:'Borderline',artist:'Tame Impala',dur:'4:08',color:'#873B43',src:S+'1.mp3',status:'ok'},
 {id:'s2',title:'Feels Like We Only Go Backwards',artist:'Tame Impala',dur:'3:12',color:'#4a6a6a',src:S+'2.mp3',status:'ok'},
 {id:'s3',title:'Nightcall',artist:'Kavinsky',dur:'4:18',color:'#222',src:S+'3.mp3',status:'ok'},
 {id:'s4',title:'Genesis',artist:'Grimes',dur:'4:15',color:'#777671',src:S+'4.mp3',status:'ok'}]

export const THREADS: Thread[] = [
 {id:'t1',title:'Le dernier album qui vous a retourné ?',author:'mira',cat:'Music',date:'2026-11-20',posts:[{a:'mira',t:'Je cherche des idées, surprenez-moi.',d:'20/11'},{a:'jo',t:'Currents, encore et toujours.',d:'20/11'}]},
 {id:'t2',title:'Bandes originales cultes',author:'leo',cat:'Cinema',date:'2026-11-18',posts:[{a:'leo',t:'Drive, Blade Runner… et vous ?',d:'18/11'}]},
 {id:'t3',title:'Présentez-vous',author:'admin',cat:'General',date:'2026-11-10',posts:[{a:'admin',t:'Bienvenue dans la communauté.',d:'10/11'}]}]