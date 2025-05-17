import  { RefObject } from 'react'

const UseDropdownPosition = (
  ref: RefObject<HTMLDivElement | null> | RefObject<HTMLDivElement>
) => {

  const getDropdownPosition = () => {
    if(!ref.current) return { top: 0, left: 0 };

    const rect = ref.current.getBoundingClientRect();           //  Se obtiene la posición y tamaño del elemento en pantalla con getBoundingClientRect().

    const dropdownWidth = 240;                                  // Ancho del dropdown

    // Intenta colocar el dropdown debajo del elemento
    let left = rect.left + window.scrollX;                      // Calcula la posición horizontal (left) y vertical (top) tomando en cuenta el scroll de la página  
    const top = rect.bottom + window.scrollY;                     // para posicionar correctamente el dropdown justo debajo del elemento.

    // Si se sale por la derecha, moverlo hacia la izquierda
    if (left + dropdownWidth > window.innerWidth) {             // Si el dropdown se sale del lado derecho:
      left = rect.right + window.scrollX - dropdownWidth        // Ajusta la posición hacia la izquierda para que el dropdown no se desborde.
      
      // Si aún así se sale por la izquierda, 
      // colocarlo fijo cerca del borde derecho
      if (left < 0) {                                             // Luego, si después de ese cálculo el left termina siendo negativo (es decir, se iría fuera por el lado izquierdo),  
        left = window.innerWidth - dropdownWidth - 16             // se corrige forzándolo a estar dentro del viewport:  
      }
    }


    if(left < 0){
      left = 16;
    }

    return { top, left }

  }

  return { getDropdownPosition}
}

export default UseDropdownPosition