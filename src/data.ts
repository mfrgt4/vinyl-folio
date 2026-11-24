export interface Vinyl { id:string; title:string; cat:string; year:number; color:string; desc:string; tools:string[] }
export interface Song { id:string; title:string; artist:string; dur:string; color:string; src?:string; link?:string; by?:string; status:'ok'|'pending' }
export interface Post { a:string; t:string; d:string }
export interface Thread { id:string; title:string; author:string; cat:string; date:string; posts:Post[] }
export const CATS = ['All','General','Music','Cinema','Gaming','Random']
const S = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-'
export const VINYLS: Vinyl[] = [
 {id:'v1',title:'Night Signal',cat:'Identité visuelle',year:2024,color:'#873B43',desc:'Identité complète pour un label indépendant.',tools:['Figma','Illustrator']},
 {id:'v2',title:'Paper Waves',cat:'Web design',year:2023,color:'#171717',desc:'Site éditorial pour un magazine musical.',tools:['React','Three.js']},
 {id:'v3',title:'Slow Rush',cat:'Motion',year:2024,color:'#777671',desc:'Habillage animé pour un festival.',tools:['After Effects']},
 {id:'v4',title:'Low Light',cat:'Photographie',year:2022,color:'#D2D1CC',desc:'Série argentique en concert.',tools:['Lightroom']},
 {id:'v5',title:'Grain',cat:'Packaging',year:2023,color:'#3a3a38',desc:'Pochettes et packaging de vinyles.',tools:['InDesign']}]
export const SONGS: Song[] = [
 {id:'s1',title:'Borderline',artist:'Tame Impala',dur:'4:08',color:'#873B43',src:S+'1.mp3',status:'ok'},
 {id:'s2',title:'Feels Like We Only Go Backwards',artist:'Tame Impala',dur:'3:12',color:'#4a6a6a',src:S+'2.mp3',status:'ok'},
 {id:'s3',title:'Nightcall',artist:'Kavinsky',dur:'4:18',color:'#222',src:S+'3.mp3',status:'ok'},
 {id:'s4',title:'Genesis',artist:'Grimes',dur:'4:15',color:'#777671',src:S+'4.mp3',status:'ok'}]
export const THREADS: Thread[] = [
 {id:'t1',title:'Le dernier album qui vous a retourné ?',author:'mira',cat:'Music',date:'2026-11-20',posts:[{a:'mira',t:'Je cherche des idées, surprenez-moi.',d:'20/11'},{a:'jo',t:'Currents, encore et toujours.',d:'20/11'}]},
 {id:'t2',title:'Bandes originales cultes',author:'leo',cat:'Cinema',date:'2026-11-18',posts:[{a:'leo',t:'Drive, Blade Runner… et vous ?',d:'18/11'}]},
 {id:'t3',title:'Présentez-vous',author:'admin',cat:'General',date:'2026-11-10',posts:[{a:'admin',t:'Bienvenue dans la communauté.',d:'10/11'}]}]
