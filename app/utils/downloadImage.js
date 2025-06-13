import { toPng } from "html-to-image";

export const downloadImage = async (captureRef, childrenRef) => {
  let dataUrl;
  const filter = (node) => {
    const exclusionClasses = ["exclude-from-capture"];
    return !exclusionClasses.some((classname) =>
      node.classList?.contains(classname)
    );
  };
  const showLoader = document.getElementById("capture-loader");
  const arrow = document.getElementsByClassName("capture-arrow")[0];
  arrow?.classList.add("hidden");
  showLoader?.classList.remove("hidden");

  if (!captureRef) {
    const element = document.getElementById("capture-area");
    element.innerHTML = document.body.innerHTML;
    //   const element = document.body; // también podés probar con document.documentElement
    if (!element) return;
    if (childrenRef) {
      childrenRef.forEach((child) => {
        if (child.type === "map") {
          const mapImageUrl = child.image;
          const mapContainer = element.querySelector(`#${child.container}`);
          if (mapContainer) {
            // Remove the SVG element
            const mapbox = mapContainer.querySelector('.mapboxgl-map');
            if (mapbox) {
              mapbox.remove();          }
            
            const img = document.createElement('img')
            img.src = mapImageUrl
            img.style.width = '100%'
            img.style.height = '100%'
            img.style.objectFit = 'contain'
            mapContainer.appendChild(img)
          }
        }
      });
    }
    // Remove all elements with exclude-from-capture class
    const excludeElements = element.querySelectorAll('.remove-from-capture');
    console.log("excludeElements",excludeElements)
    excludeElements.forEach(el => el.remove());
    
    try{
      dataUrl = await toPng(element, {
      skipFonts: true,
      cacheBust: true,
      backgroundColor: "#ffffff",
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      },
      filter: filter,
      // OJO: puede fallar si hay muchos recursos externos (imágenes, iframes, fonts)
    }); 
    }catch(e){
      console.log(e)
      document.getElementById("capture-area").innerHTML = "";
      showLoader.classList.add("hidden");
      arrow.classList.remove("hidden");
      return
    }
    
  } else if (!captureRef.current) return;
  else {
    dataUrl = await toPng(captureRef.current, {
      skipFonts: true,
      cacheBust: true,
      backgroundColor: "#ffffff",
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      },
      filter: filter,
    });
  }

  const link = document.createElement("a");
  link.download = "captura.png";
  link.href = dataUrl;
  link.click();
  document.getElementById("capture-area").innerHTML = "";
  showLoader.classList.add("hidden");
  arrow.classList.remove("hidden");
};
