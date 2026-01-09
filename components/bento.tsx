// filepath: c:\dev\cafe-citoyen\components\bento.tsx
import React from 'react';
// Le CSS est dans globals.css, donc pas d'import direct ici.

interface BentoItem {
  id: string;
  img: string;
  url:string;
}

interface BentoProps {
  items: BentoItem[];
}

const Bento: React.FC<BentoProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  // Tailles de colonnes possibles (sur une grille de 12)
  const colSpans = [3, 4, 6];

  return (
    <div className="bento-grid">
      {items.map((item, index) => {
        // Choisir une taille de manière cyclique pour un aspect "aléatoire" mais prévisible
        const span = colSpans[index % colSpans.length];
        const itemClass = `bento-item col-span-${span}`;

        return (
          <div key={item.id} className={itemClass}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="bento-link">
              <div
                className="bento-item-img"
                style={{ backgroundImage: `url(${item.img})` }}
              />
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default Bento;