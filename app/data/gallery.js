"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function GalleryPage() {

const [images,setImages] = useState([]);

useEffect(()=>{

async function loadImages(){

const querySnapshot = await getDocs(collection(db,"gallery"));

const imgs = querySnapshot.docs.map(doc=>doc.data());

setImages(imgs);

}

loadImages();

},[]);

return (

<div className="gallery">

<h1>GALLERY</h1>

<div className="gallery-grid">

{images.map((img,i)=>(

<img key={i} src={img.imageUrl} alt="Gallery Image"/>

))}

</div>

</div>

);

}