"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function GalleryPage() {

const [images,setImages] = useState([]);

useEffect(()=>{

async function fetchImages(){

const querySnapshot = await getDocs(collection(db,"gallery"));

const data = querySnapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
}));

setImages(data);

}

fetchImages();

},[]);

return(

<div style={{
padding:"80px 40px",
minHeight:"100vh"
}}>

<h1 style={{
textAlign:"center",
fontSize:"42px",
color:"#d4af37",
marginBottom:"50px"
}}>
GALLERY
</h1>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",
gap:"25px"
}}>

{images.map((img)=>(
<img
key={img.id}
src={img.imageUrl}
alt="Gallery Image"
style={{
width:"100%",
height:"280px",
objectFit:"cover",
borderRadius:"12px",
cursor:"pointer",
transition:"0.3s"
}}
/>
))}

</div>

</div>

)

}