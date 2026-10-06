import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Service, Project } from '../types';
import ServiceDetailModal from './ServiceDetailModal';
import CurvedProjectStream, { TextBounds } from './CurvedProjectStream';

interface ServicesSectionProps {
  isVisible: boolean;
  isCovered?: boolean;
  onBackToProjects: () => void;
  customLogo?: string;
  onOpenProject?: (project: Project) => void;
  onGoHome?: () => void;
}

const SERVICES: Service[] = [
  { 
    id: '1', 
    name: 'Branding', 
    description: 'Identidades únicas y sistemas visuales contemporáneos.', 
    gradient: 'radial-gradient(circle at 50% 50%, rgba(27, 242, 163, 0) 0%, rgba(27, 242, 163, 0) 50%, rgba(27, 242, 163, 0) 100%)',
    projects: [
      {
        id: 'sandbox-brand-guide',
        title: 'The Sandbox - Brand Guide',
        tags: 'Branding · Identidad Visual',
        color: '#00AEEF',
        gradient: 'linear-gradient(135deg, #00AEEF 0%, #111111 100%)',
        details: 'Brand guide y logo suite para The Sandbox.',
        image: 'https://drive.google.com/file/d/1v850ooAgvjF4zsCqwgFTj77Oku5wHbJ3/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1v850ooAgvjF4zsCqwgFTj77Oku5wHbJ3/view?usp=drive_link',
          'https://drive.google.com/file/d/1mjmUh7IS71jIsH556EkfleApwmGfguBC/view?usp=drive_link',
          'https://drive.google.com/file/d/1NyF1Q3XBIT1HmHOejMV2CABr3JS9XFy7/view?usp=drive_link',
          'https://drive.google.com/file/d/1aUcNodjY9fq1XIxJnZd1J4rPuDUlRe0r/view?usp=sharing'
        ]
      },
      {
        id: 'branding-golan-soft',
        title: 'Golan Soft rebranding',
        tags: 'Branding',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Rebranding completo para Golan Soft.',
        image: 'https://drive.google.com/file/d/1B9uRMrASEzs1LfiFOuG98ra6ZuFDrTbv/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1B9uRMrASEzs1LfiFOuG98ra6ZuFDrTbv/view?usp=drive_link',
          'https://drive.google.com/file/d/199ZLCc1tjJ4P6Q9mo4-L4lAhehlLl9jx/view?usp=drive_link',
          'https://drive.google.com/file/d/1lZRKxjuTU21IE9TQV7xPlihiGu2iTPhA/view?usp=drive_link',
          'https://drive.google.com/file/d/1c-SLn-OwjQS6NCnuZNFAf7JB-meyq79y/view?usp=drive_link',
          'https://drive.google.com/file/d/15-JmhAjcwhJELjmJ-tQLc9em3kP_4kNG/view?usp=drive_link'
        ]
      },
      {
        id: 'branding-nuevo',
        title: 'Nuevo Proyecto',
        tags: 'Branding',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Descripción de este nuevo proyecto de Branding.',
        image: 'https://drive.google.com/file/d/1P_NxYfHh-ZtnCvuaF2N8GVNn9N9NXZiu/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1P_NxYfHh-ZtnCvuaF2N8GVNn9N9NXZiu/view?usp=drive_link',
          'https://drive.google.com/file/d/1-Mqn8V2IR1r2QnzscQaEZwug9AoLo9d2/view?usp=drive_link',
          'https://drive.google.com/file/d/1KSpxHErzaD9ywVxmPluMBNup6iryWfP4/view?usp=drive_link',
          'https://drive.google.com/file/d/1ZLK0X05Na2jRojKjv9EcA1TEsbY2nrA6/view?usp=drive_link',
          'https://drive.google.com/file/d/1hzIVLmznBdJ7Lak54yKWefoM81C3I0SB/view?usp=drive_link',
          'https://drive.google.com/file/d/1TqE4R4KRA-bzzQOX6LHifH7nPbs6k86I/view?usp=drive_link'
        ]
      },
      {
        id: '1',
        title: 'Branding',
        tags: 'Branding · Identidad Visual',
        color: '#EA5628',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #EA5628 100%)',
        details: 'Análisis estratégica y diseño de marca.',
        image: 'https://drive.google.com/file/d/1zLgQG4x9zjvPKCfe_9CAwGLjVsCDEhJ8/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1zLgQG4x9zjvPKCfe_9CAwGLjVsCDEhJ8/view?usp=drive_link',
          'https://drive.google.com/file/d/1sk6kyEidTrqrlwjIqzFSv5ffBV1wwd8i/view?usp=drive_link',
          'https://drive.google.com/file/d/1RV7n3K8X-NWHOVS8xvoWgIHb8s-wVIkF/view?usp=drive_link',
          'https://drive.google.com/file/d/1cGHDHd1St-zfT2U_6hWaNSKBtMi4zdph/view?usp=drive_link',
          'https://drive.google.com/file/d/1PBf5ER8YVcxxTCyXHNgVkUN41eV72KkN/view?usp=drive_link'
        ]
      },
      {
        id: 'branding-project-new',
        title: 'Diseño de Marca / Branding',
        tags: 'Branding · Identidad Visual',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Desarrollo de identidad visual y diseño de marca.',
        image: 'https://drive.google.com/file/d/1blmVcgFJ3TRZdPr1VnoVajbiqnnaO3Us/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1blmVcgFJ3TRZdPr1VnoVajbiqnnaO3Us/view?usp=drive_link',
          'https://drive.google.com/file/d/1zI7DpRX1JCVBXSWSUOfxS8ZZ5QAawUmw/view?usp=drive_link'
        ]
      }
    ]
  },
  { 
    id: '2', 
    name: 'Web', 
    description: 'Diseño y desarrollo de experiencias e interfaces digitales.', 
    gradient: 'radial-gradient(circle at 50% 50%, rgba(27, 242, 163, 0) 0%, rgba(27, 242, 163, 0) 50%, rgba(27, 242, 163, 0) 100%)',
    projects: [
      {
        id: 'web-project-1',
        title: 'Web Design 01',
        tags: 'Web · UI/UX',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Diseño de interfaz y experiencia de usuario.',
        image: 'https://drive.google.com/file/d/1te2jhHMubdt387dN0hdp2jOHN2GG_rvw/view?usp=drive_link'
      },
      {
        id: 'web-project-2',
        title: 'Web Design 02',
        tags: 'Web · UI/UX',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Diseño de interfaz y experiencia de usuario.',
        image: 'https://drive.google.com/file/d/1e0R-0FTp-WeDfTnPQPdjsTBRbqzHTmLH/view?usp=drive_link'
      },
      {
        id: 'web-project-3',
        title: 'Web Design 03',
        tags: 'Web · UI/UX',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Diseño de interfaz y experiencia de usuario.',
        image: 'https://drive.google.com/file/d/1jaq2ZAlKQ-NBl_i4KqfA9IiXKPv-E2N4/view?usp=drive_link'
      }
    ]
  },
  { 
    id: '3', 
    name: 'Motion Video y Animacion', 
    description: 'Dirección de arte, storytelling y animación en movimiento.', 
    gradient: 'radial-gradient(circle at 50% 50%, rgba(27, 242, 163, 0) 0%, rgba(27, 242, 163, 0) 50%, rgba(27, 242, 163, 0) 100%)',
    projects: [
      {
        id: '2',
        title: 'Opening - B/side',
        tags: 'Motion Grafiphics',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #2B1F21 0%, #00FFC2 100%)',
        details: 'Exploración de ritmo y morfología en animación tridimensional interactiva.',
        video: 'https://drive.google.com/file/d/15o5Sh7MGyC9vC-zMbcQfkU3OGMGE8ZG4/view?usp=drive_link',
      },
      {
        id: '3',
        title: 'Campaña de concientisacion para la seguridad ',
        tags: 'Video - Story Board - Animación',
        color: '#EA5628',
        gradient: 'linear-gradient(135deg, #EA5628 0%, #2B1F21 100%)',
        details: 'Dirección de arte e ilustración para la edición de colección de Revista Montevideo.',
        video: 'https://www.youtube.com/watch?v=BYy8S3d-71U',
        videos: [
          'https://www.youtube.com/watch?v=BYy8S3d-71U',
          'https://www.youtube.com/watch?v=o_BxJP7YffY',
          'https://www.youtube.com/watch?v=saPCm-1aQAw',
          'https://www.youtube.com/watch?v=8GB4NhI1vy8',
          'https://www.youtube.com/watch?v=vEjAW2b80Gk'
        ]
      }
    ]
  },
  { 
    id: '4', 
    name: 'Ilustración', 
    description: 'Narrativas gráficas, editoriales y conceptuales.', 
    gradient: 'radial-gradient(circle at 50% 50%, rgba(27, 242, 163, 0) 0%, rgba(27, 242, 163, 0) 50%, rgba(27, 242, 163, 0) 100%)',
    projects: [
      {
        id: 'ilustraciones-varias',
        title: 'Colección de Ilustraciones',
        tags: 'Ilustración - Arte Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Exploración visual, narrativa gráfica y desarrollo de piezas de ilustración conceptual.',
        image: 'https://drive.google.com/file/d/1VkFWDqP14E1nEGbH8F6kE5nPCJsoYzXe/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1VkFWDqP14E1nEGbH8F6kE5nPCJsoYzXe/view?usp=drive_link',
          'https://drive.google.com/file/d/15x6zynGSTMw5MlFjhgIPKAGw0Xtc0F4Q/view?usp=drive_link',
          'https://drive.google.com/file/d/1ABRUngj29WqqNTpX7UYvhSzwa6qzGyS6/view?usp=drive_link',
          'https://drive.google.com/file/d/15M2AHTq3E2E2UvYiWst6woekEdGWveU2/view?usp=drive_link',
          'https://drive.google.com/file/d/109JmK5Lv9Fwu-zin5lCgOJRZgU-862g3/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-2',
        title: 'Serie de Ilustraciones 02',
        tags: 'Ilustración - Arte Digital',
        color: '#EA5628',
        gradient: 'linear-gradient(135deg, #EA5628 0%, #111111 100%)',
        details: 'Exploración de estilo y desarrollo de narrativa gráfica.',
        image: 'https://drive.google.com/file/d/1mBTxI_NpQU5v10N5y77TQLxXUwcJ0iI5/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1mBTxI_NpQU5v10N5y77TQLxXUwcJ0iI5/view?usp=drive_link',
          'https://drive.google.com/file/d/14SaMVgjt3LMeUZ_uHTfe0BoeT3WBKfr0/view?usp=drive_link',
          'https://drive.google.com/file/d/1GNISdPhM0WdJAqCrq3HFm8jujf5cQ-i2/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-3',
        title: 'Serie de Ilustraciones 03',
        tags: 'Ilustración - Arte Digital',
        color: '#00AEEF',
        gradient: 'linear-gradient(135deg, #00AEEF 0%, #111111 100%)',
        details: 'Composiciones visuales, color y narrativa conceptual.',
        image: 'https://drive.google.com/file/d/12X2pQIimUiId1v35xtx7sQwnqrEhw3JC/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/12X2pQIimUiId1v35xtx7sQwnqrEhw3JC/view?usp=drive_link',
          'https://drive.google.com/file/d/1a2AoWg5X6Sm4mMZyzGnjo6zvrKhd4Xqp/view?usp=drive_link',
          'https://drive.google.com/file/d/1e_MWGl8NVzNcIBxTPNLlz0V6HVemA-uo/view?usp=drive_link',
          'https://drive.google.com/file/d/1lVscOjYNYjBjpmpr0bgK0Uw9L7SRnckM/view?usp=drive_link',
          'https://drive.google.com/file/d/1EKOGvIU2pWYj8jrvhwV5n1rNe0kh4xDr/view?usp=drive_link',
          'https://drive.google.com/file/d/1JH_vcf_i9vIWhkk_JL9_AZyoPpzle26w/view?usp=drive_link',
          'https://drive.google.com/file/d/19O9eYkFkmpfiY2nzfbFYBg_T8hGm4u74/view?usp=drive_link'
        ]
      },
      {
        id: '4-ilustracion',
        title: 'Social Archive',
        tags: 'Digital Content · Social Media',
        color: '#2B1F21',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #2B1F21 100%)',
        details: 'Campaña interactiva y diseño de cuadrículas editoriales digitales para plataformas.',
        image: 'https://drive.google.com/file/d/1Brlfu9BNF9kU1zq6T9NTNhmC3ta1ypGK/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1Brlfu9BNF9kU1zq6T9NTNhmC3ta1ypGK/view?usp=drive_link',
          'https://drive.google.com/file/d/1IK751vGA_g-hwG8SIpaA2z1GBtjD9ppd/view?usp=drive_link',
          'https://drive.google.com/file/d/14s_Tl2--9GZuucwfwft8MoPVUVTFEhP0/view?usp=drive_link',
          'https://drive.google.com/file/d/1u6K8V_JvuX3LMmeWxbDUyC9XBGN0zY07/view?usp=drive_link',
          'https://drive.google.com/file/d/1lNfmkO4K6sfRzF-JCnUZMw6loHOG-4fq/view?usp=drive_link'
        ]
      },
      {
        id: '6-ilustracion',
        title: 'Game Maker - Ilustración UI',
        tags: 'Ilustración - 3D - Concept Art',
        color: '#EA5628',
        gradient: 'linear-gradient(135deg, #2B1F21 0%, #EA5628 100%)',
        details: 'Composición y conceptualización de ilustraciones complejas para uso web.',
        image: 'https://drive.google.com/file/d/13yFVS2SQAA4kY9rsq-pAg81ikO2ZhUBT/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/13yFVS2SQAA4kY9rsq-pAg81ikO2ZhUBT/view?usp=drive_link',
          'https://drive.google.com/file/d/1P0J_XxrDnJIZvPDoLWLHkDtTy-CvFDdh/view?usp=drive_link',
          'https://drive.google.com/file/d/1_6Nj0nYgKwR_Cad3B5yNYl1Mc4ar0tU1/view?usp=drive_link',
          'https://drive.google.com/file/d/1QEZLzjDDAtoflZepO-qRQARFGk_3dx01/view?usp=drive_link',
          'https://drive.google.com/file/d/1FLK8AZE-nrTTqHB_NioEHWWqgSlpBYAA/view?usp=drive_link',
          'https://drive.google.com/file/d/10IsurJH2uES9EFWR9hCQZHt5arM0A8H1/view?usp=drive_link',
          'https://drive.google.com/file/d/1GSfcTC-HPBQbewmzrt__LiZyS_rOnzVc/view?usp=drive_link',
          'https://drive.google.com/file/d/1bUo0BMBpLfdfHJ7JGmUzIu-nTtIaCYCL/view?usp=drive_link',
          'https://drive.google.com/file/d/1qJXrZTIlTmF1o6Q9lxenScKD1NY10yLQ/view?usp=drive_link',
          'https://drive.google.com/file/d/1_nJQd2Jvig4sDvVaoDPc6H_vasS0aCc-/view?usp=drive_link',
          'https://drive.google.com/file/d/1qtgG5NMNP6YX4zZ4cWPBRDYPmU3Y69Ac/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-4',
        title: 'Serie de Ilustraciones 04',
        tags: 'Ilustración - Arte Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Exploración gráfica, color y desarrollo visual.',
        image: 'https://drive.google.com/file/d/198tE-N0xSNvtB-avzrGYLXLDUuSeJ27T/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/198tE-N0xSNvtB-avzrGYLXLDUuSeJ27T/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-5',
        title: 'Serie de Ilustraciones 05',
        tags: 'Ilustración - Arte Digital',
        color: '#EA5628',
        gradient: 'linear-gradient(135deg, #EA5628 0%, #111111 100%)',
        details: 'Exploración visual y conceptualización gráfica.',
        image: 'https://drive.google.com/file/d/1bYDGRD8Hk8nfQv9u4x_sYndbCosmeX_9/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1bYDGRD8Hk8nfQv9u4x_sYndbCosmeX_9/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-6',
        title: 'Serie de Ilustraciones 06',
        tags: 'Ilustración - Arte Digital',
        color: '#00AEEF',
        gradient: 'linear-gradient(135deg, #00AEEF 0%, #111111 100%)',
        details: 'Composición de ilustración y arte conceptual.',
        image: 'https://drive.google.com/file/d/1Ce3SpsO5OSPffNOlyQkKslV5X5k_mC8t/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1Ce3SpsO5OSPffNOlyQkKslV5X5k_mC8t/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-7',
        title: 'Serie de Ilustraciones 07',
        tags: 'Ilustración - Arte Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Desarrollo visual, creatividad y arte conceptual.',
        image: 'https://drive.google.com/file/d/1h_ACHbLjGyEaKST-XWw3p3LQAutIuGeT/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1h_ACHbLjGyEaKST-XWw3p3LQAutIuGeT/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-8',
        title: 'Serie de Ilustraciones 08',
        tags: 'Ilustración - Arte Digital',
        color: '#EA5628',
        gradient: 'linear-gradient(135deg, #EA5628 0%, #111111 100%)',
        details: 'Concept art, composición gráfica y exploración visual.',
        image: 'https://drive.google.com/file/d/10MApiAmGSuJAm3qCPXj8Mu-2QhkhjHAt/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/10MApiAmGSuJAm3qCPXj8Mu-2QhkhjHAt/view?usp=drive_link',
          'https://drive.google.com/file/d/1KiQtzZQBx18vW-RFVp4A9zoOs8yQT6tT/view?usp=drive_link',
          'https://drive.google.com/file/d/1Ad_eRlbQcSK0WkKE_ixG4fPq3bjtkZxn/view?usp=drive_link',
          'https://drive.google.com/file/d/1hsxUEPyPv34WHL12Ix1jDYYvP7NjNX93/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-9',
        title: 'Serie de Ilustraciones 09',
        tags: 'Ilustración - Arte Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Desarrollo visual y piezas gráficas conceptuales.',
        image: 'https://drive.google.com/file/d/1_ldhVPLQZNoa9lI-ZpYvMNmZd67dr5FV/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1_ldhVPLQZNoa9lI-ZpYvMNmZd67dr5FV/view?usp=drive_link',
          'https://drive.google.com/file/d/1-J-3xBt2kIRa5zI9ljye1_7bE_-8cvok/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-10',
        title: 'Serie de Ilustraciones 10',
        tags: 'Ilustración - Arte Digital',
        color: '#EA5628',
        gradient: 'linear-gradient(135deg, #EA5628 0%, #111111 100%)',
        details: 'Exploración gráfica, color y desarrollo visual.',
        image: 'https://drive.google.com/file/d/1coAf_vyJDeJfR5ku0xu-PlAPnJX8QaKY/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1coAf_vyJDeJfR5ku0xu-PlAPnJX8QaKY/view?usp=drive_link',
          'https://drive.google.com/file/d/1gUsmeeZTloPFMJJaE1CTBzD706jCNL_Q/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-11',
        title: 'Serie de Ilustraciones 11',
        tags: 'Ilustración - Arte Digital',
        color: '#00AEEF',
        gradient: 'linear-gradient(135deg, #00AEEF 0%, #111111 100%)',
        details: 'Composición de ilustración y arte conceptual.',
        image: 'https://drive.google.com/file/d/1ACyB6gXWusrcv06P29aYyfapGmlyZZSY/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1ACyB6gXWusrcv06P29aYyfapGmlyZZSY/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-12',
        title: 'Serie de Ilustraciones 12',
        tags: 'Ilustración - Arte Digital',
        color: '#EA5628',
        gradient: 'linear-gradient(135deg, #EA5628 0%, #111111 100%)',
        details: 'Exploración de estilo y desarrollo de narrativa gráfica.',
        image: 'https://drive.google.com/file/d/1sai1ONQ0ai4-nq7d4kdaM5Tyni523XLc/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1sai1ONQ0ai4-nq7d4kdaM5Tyni523XLc/view?usp=drive_link',
          'https://drive.google.com/file/d/1dXL0gVbmuwzZCp2PI4O7c2iU_sKIww6e/view?usp=drive_link',
          'https://drive.google.com/file/d/1T6a3JUC-xFsLpD9EGoNNrAkMrWRAF4D8/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-13',
        title: 'Serie de Ilustraciones 13',
        tags: 'Ilustración - Arte Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Arte conceptual, diseño de personajes y entornos.',
        image: 'https://drive.google.com/file/d/1N_lhTJpBaErr6XZJc3PBJWceFVxovGYX/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1N_lhTJpBaErr6XZJc3PBJWceFVxovGYX/view?usp=drive_link',
          'https://drive.google.com/file/d/1HPxWFjjJJMZaBnNQetHtddx98gw11_wb/view?usp=drive_link',
          'https://drive.google.com/file/d/1zyWc0M1qcELnrdGwUiZdcSoK7S_a-2AO/view?usp=drive_link',
          'https://drive.google.com/file/d/15QC5Ip34UewYrFrZ5y2KLpuYakOhJ7R2/view?usp=drive_link',
          'https://drive.google.com/file/d/1CfbuUjqinl2Vp2mKp5uy2ln3HwyG2LYi/view?usp=drive_link',
          'https://drive.google.com/file/d/1JabfCSsd4Hu65On4_8j_NfNBPiZWjHw3/view?usp=drive_link',
          'https://drive.google.com/file/d/1g39njYvwIQ8kmoBla2if_g2a4QHyUJez/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-14',
        title: 'Serie de Ilustraciones 14',
        tags: 'Ilustración - Arte Digital',
        color: '#00AEEF',
        gradient: 'linear-gradient(135deg, #00AEEF 0%, #111111 100%)',
        details: 'Exploración de arte digital y composición narrativa.',
        image: 'https://drive.google.com/file/d/14H17r1vzXs7lBtwxxhJOiM0zdP5pjZzO/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/14H17r1vzXs7lBtwxxhJOiM0zdP5pjZzO/view?usp=drive_link',
          'https://drive.google.com/file/d/1gZpg2dP0N40zdyBEKZkEY8blAD-4QbZD/view?usp=drive_link',
          'https://drive.google.com/file/d/1i8rkHmj1F7nRBfElj0_RQZfHPXkUOwVY/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-15',
        title: 'Serie de Ilustraciones 15',
        tags: 'Ilustración - Arte Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Composición visual y desarrollo de piezas de ilustración conceptual.',
        image: 'https://drive.google.com/file/d/1tmc8EcLzQU0P3dLhr7d0Oc7lwliJsabP/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1tmc8EcLzQU0P3dLhr7d0Oc7lwliJsabP/view?usp=drive_link',
          'https://drive.google.com/file/d/1ONfuZzuAmpe4V3l4MA_p29Yf_pmHbOLc/view?usp=drive_link',
          'https://drive.google.com/file/d/1V_UvCYyLeqFmKxH0Q04LY6wXEfS7cCvv/view?usp=drive_link',
          'https://drive.google.com/file/d/1U9kRTqJhSFVm74BpFCFosG-aBT3B4DBa/view?usp=drive_link'
        ]
      },
      {
        id: 'ilustraciones-serie-16',
        title: 'Serie de Ilustraciones 16',
        tags: 'Ilustración - Arte Digital',
        color: '#EA5628',
        gradient: 'linear-gradient(135deg, #EA5628 0%, #111111 100%)',
        details: 'Ilustración digital y exploración de color.',
        image: 'https://drive.google.com/file/d/1Tt6N6qgNTRHTio41mQJ87K2sMdP3f0iE/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1Tt6N6qgNTRHTio41mQJ87K2sMdP3f0iE/view?usp=drive_link'
        ]
      }
    ]
  },
  { id: '5', name: 'Diseño Editorial', description: 'Sistemas de retículas, maquetación y publicaciones físicas.', gradient: 'radial-gradient(circle at 50% 50%, rgba(27, 242, 163, 0) 0%, rgba(27, 242, 163, 0) 50%, rgba(27, 242, 163, 0) 100%)' },
  { 
    id: '6', 
    name: 'Social Media', 
    description: 'Estrategias de contenido y assets dinámicos.', 
    gradient: 'radial-gradient(circle at 50% 50%, rgba(27, 242, 163, 0) 0%, rgba(27, 242, 163, 0) 50%, rgba(27, 242, 163, 0) 100%)',
    projects: [
      {
        id: 'social-media-1',
        title: 'Campaña Social Media',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/18QK-bc_X6ocziSrnQOHD5cZN17Yg7GpG/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/18QK-bc_X6ocziSrnQOHD5cZN17Yg7GpG/view?usp=drive_link',
          'https://drive.google.com/file/d/1cehowOcNc59ywdQi_68iUFM2z3OEf5Rx/view?usp=drive_link',
          'https://drive.google.com/file/d/1QpcA34yE720gZcnLfavkDNfbio91s5S4/view?usp=drive_link',
          'https://drive.google.com/file/d/1NLmwGqj07P7l8vZbq-I46EfUsFL8_Y9s/view?usp=drive_link',
          'https://drive.google.com/file/d/1yZKo5AgD672Qi85x1tYc3Lm4u7IDS61M/view?usp=drive_link',
          'https://drive.google.com/file/d/1u3dWp8wpelVw03eP0ZHan7rl7JuRN2oc/view?usp=drive_link'
        ]
      },
      {
        id: 'social-media-2',
        title: 'Serie Social Media 02',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/1QCRfEIZZdH7AQ4UOhP2JJSPS3s47ZhdC/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1QCRfEIZZdH7AQ4UOhP2JJSPS3s47ZhdC/view?usp=drive_link',
          'https://drive.google.com/file/d/1ocwtw7WKa7d6gEjHgt4uLbQ5ERr34qsl/view?usp=drive_link',
          'https://drive.google.com/file/d/1GP0vsfqkGx54Hn5QZXjwh7VADaF7lyZ4/view?usp=drive_link',
          'https://drive.google.com/file/d/1oVkJDK-tvpzfRbl5UTaPHUXn_O_6-xWu/view?usp=drive_link',
          'https://drive.google.com/file/d/19d3Ga6cNxTTwg1tndeT5Z5OZcR6HF3Ok/view?usp=drive_link',
          'https://drive.google.com/file/d/1DOiealWPRiXaYT7nj6K3Jw7DILMBZUBm/view?usp=drive_link',
          'https://drive.google.com/file/d/1TegFeXfsKE7FYNtxjfojLDz4IWint0NW/view?usp=drive_link',
          'https://drive.google.com/file/d/1-B5_ROQcGUmJLjP0ofWfYv40SeEqQvsM/view?usp=drive_link',
          'https://drive.google.com/file/d/19xrC2MryAThGmUp1LOZIPZoZ7iSd9FbF/view?usp=drive_link'
        ]
      },
      {
        id: 'social-media-3',
        title: 'Serie Social Media 03',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/1cyO2ZC3bWxuWVMeCHxoGR4pYt9JvuCAi/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1cyO2ZC3bWxuWVMeCHxoGR4pYt9JvuCAi/view?usp=drive_link',
          'https://drive.google.com/file/d/1sFxYYqkAZLI8P3pHCbk0zua_htDMqO-C/view?usp=drive_link'
        ]
      },
      {
        id: 'social-media-4',
        title: 'Serie Social Media 04',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/14-k6CM1YC1lcl6QB8RAk-SJhcEbrjLGn/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/14-k6CM1YC1lcl6QB8RAk-SJhcEbrjLGn/view?usp=drive_link',
          'https://drive.google.com/file/d/1c1slbbQocpr3qmIDZ98s7VDO1fu8MIGe/view?usp=drive_link',
          'https://drive.google.com/file/d/1yUDVeauX6P8hrUcf20bQJlPXW4Zz2g3k/view?usp=drive_link',
          'https://drive.google.com/file/d/12XGa6OwY7EZVLM-rvXR7V5v8SeYO4swS/view?usp=drive_link',
          'https://drive.google.com/file/d/1NOvckx1nGjVm3_k3QbVejiUzKgl7zPtg/view?usp=drive_link',
          'https://drive.google.com/file/d/1tolKq4xJShHCgzotWtwQc4vBcfFVJQrJ/view?usp=drive_link'
        ]
      },
      {
        id: 'social-media-5',
        title: 'Serie Social Media 05',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/1NnWLxr4Ft0GUmrsgvm5BX6sg6hfLj7hm/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1NnWLxr4Ft0GUmrsgvm5BX6sg6hfLj7hm/view?usp=drive_link',
          'https://drive.google.com/file/d/1KZhFg3P8fe6HZo5xC92sJoO4GSl2aDLx/view?usp=drive_link',
          'https://drive.google.com/file/d/1LlPCNhJW5fSgTKJIjgY89otBt-bdnwqE/view?usp=drive_link',
          'https://drive.google.com/file/d/1YhsfqImRE0sgnzxUP9MLm_7jAgfAyqEU/view?usp=drive_link',
          'https://drive.google.com/file/d/1_E4zPUmCFBT_3G8bVApi5Y-a4XKb0IB6/view?usp=drive_link'
        ]
      },
      {
        id: 'social-media-6',
        title: 'Serie Social Media 06',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/1m-L4COLseiKobK0y1c1Z5gaMEWT5kyIU/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1m-L4COLseiKobK0y1c1Z5gaMEWT5kyIU/view?usp=drive_link'
        ]
      },
      {
        id: 'social-media-7',
        title: 'Serie Social Media 07',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/1Q_1YtX-VopNdZnI8Ibj6BXHaoLQsh3yI/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1Q_1YtX-VopNdZnI8Ibj6BXHaoLQsh3yI/view?usp=drive_link',
          'https://drive.google.com/file/d/1L8__XnBEDOxXr4BAl4MJVjxgtBGv1qfH/view?usp=drive_link',
          'https://drive.google.com/file/d/1zEadAb1Iu035_oasf7xgEdtMQsqJbAOI/view?usp=drive_link',
          'https://drive.google.com/file/d/1hKlnPZxTK1nZIDhFNsD-FHPQw1V0ergQ/view?usp=drive_link'
        ]
      },
      {
        id: 'social-media-8',
        title: 'Serie Social Media 08',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/1_1QQFbj2uEyQkyNiYjx_F2AYEnkVklOb/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1_1QQFbj2uEyQkyNiYjx_F2AYEnkVklOb/view?usp=drive_link',
          'https://drive.google.com/file/d/17jocUjHgu7qTlkADHpLBPfajILm4E0jL/view?usp=drive_link',
          'https://drive.google.com/file/d/1TA2nWw_ipPBIdJ4HWEnjU_3_8uDEwCnL/view?usp=drive_link',
          'https://drive.google.com/file/d/1jQrQk3Wyndzw0lpOzzZm5MXh2dN1E0hA/view?usp=drive_link',
          'https://drive.google.com/file/d/1V-StVViFkQ_0DWNLZd_v4HgwNAbWzcvV/view?usp=drive_link',
          'https://drive.google.com/file/d/1F9bPFSV4tFrx_zxoGzu14bA4LIkt9vKW/view?usp=drive_link',
          'https://drive.google.com/file/d/1DZB8PIEaWx-sjQURRlM2puLiThDh2rDb/view?usp=drive_link'
        ]
      },
      {
        id: 'social-media-9',
        title: 'Serie Social Media 09',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/1-aMDJ4oc92yu65yF1-mmvLAkQhKXlgVd/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1-aMDJ4oc92yu65yF1-mmvLAkQhKXlgVd/view?usp=drive_link',
          'https://drive.google.com/file/d/1R1e2M_E7v-iIwE6dsyynkbkqZkuYFxQF/view?usp=drive_link',
          'https://drive.google.com/file/d/17svgRGzv8-9HP3_lQcocwi_VdcHfKlq8/view?usp=drive_link'
        ]
      },
      {
        id: 'social-media-10',
        title: 'Serie Social Media 10',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/1t2xDDzH3fy42bIfp0JzOfSHUl4YnGv9s/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1t2xDDzH3fy42bIfp0JzOfSHUl4YnGv9s/view?usp=drive_link'
        ]
      },
      {
        id: 'social-media-11',
        title: 'Serie Social Media 11',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/1XOCvPyCYiMjnxJtA9CdZUXMcZD4uUbRb/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1XOCvPyCYiMjnxJtA9CdZUXMcZD4uUbRb/view?usp=drive_link',
          'https://drive.google.com/file/d/12Gas3vZhUBH-cKHxH_WkFQMMIMJ_-H_q/view?usp=drive_link',
          'https://drive.google.com/file/d/1kz9Rr37y6QWG5KmsbhQ-CQm8QwCPuP-G/view?usp=drive_link',
          'https://drive.google.com/file/d/1IqYUQC6F4XDYKv9J6wilNp2ZfBp6FYGE/view?usp=drive_link',
          'https://drive.google.com/file/d/1dVhk6rgaAiynWsJ3aGQSnmJHbq6nz270/view?usp=drive_link'
        ]
      },
      {
        id: 'social-media-12',
        title: 'Serie Social Media 12',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/1xGx3YcjfarlIwpVktw_hnpg_OtOUseBX/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1xGx3YcjfarlIwpVktw_hnpg_OtOUseBX/view?usp=drive_link',
          'https://drive.google.com/file/d/1GLeISb5VWG8xTj5RF1EjBV_LF2apora1/view?usp=drive_link',
          'https://drive.google.com/file/d/14TckmbrKz0saIZyxe_LtevR0yi0BQqRB/view?usp=drive_link',
          'https://drive.google.com/file/d/11B8ysE1jNx_86lo2OB__XaViibBfSa1c/view?usp=drive_link',
          'https://drive.google.com/file/d/1YeesRkBNWTk5527VSz2ccza4H88XYJZr/view?usp=drive_link',
          'https://drive.google.com/file/d/1XK1USe24oIAml2twga6AFU9Lna8itScr/view?usp=drive_link',
          'https://drive.google.com/file/d/1jTK7uzqQMg3az_pdWv6n_XZfCCUZW_mF/view?usp=drive_link',
          'https://drive.google.com/file/d/1OD0-6acakbVZnq1t8vm0U4M8wrbmmRPh/view?usp=drive_link',
          'https://drive.google.com/file/d/1qe8Rba_tYSPCuzoAyWITwJAFCq6Iy7yW/view?usp=drive_link'
        ]
      },
      {
        id: 'social-media-13',
        title: 'Serie Social Media 13',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/1EB0xR9rkfCWSIurPJ7TZu55EMhSS7c2K/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1EB0xR9rkfCWSIurPJ7TZu55EMhSS7c2K/view?usp=drive_link',
          'https://drive.google.com/file/d/10g38lsGI9KhedAgmGw9deEjiNsbGL0T7/view?usp=drive_link',
          'https://drive.google.com/file/d/1z13gEBq1wLd6-PyrBSui4vB_nBHW3VUX/view?usp=drive_link'
        ]
      },
      {
        id: 'social-media-14',
        title: 'Serie Social Media 14',
        tags: 'Social Media · Contenido Digital',
        color: '#00FFC2',
        gradient: 'linear-gradient(135deg, #00FFC2 0%, #111111 100%)',
        details: 'Estrategia visual, diseño de contenido y assets dinámicos para redes sociales.',
        image: 'https://drive.google.com/file/d/1UI09e11dDT4UTpUfOEuSXaewnT27luma/view?usp=drive_link',
        images: [
          'https://drive.google.com/file/d/1UI09e11dDT4UTpUfOEuSXaewnT27luma/view?usp=drive_link',
          'https://drive.google.com/file/d/1vHwHreZLEINUFHTaJS4H4_nzyFsUTExR/view?usp=drive_link',
          'https://drive.google.com/file/d/1Jp1ugdTnc2R_H2vs-aCTgUDwWw7B4yTq/view?usp=drive_link',
          'https://drive.google.com/file/d/1ABeJC14SfZDq6GajbMIZhbkT8xMAOnIf/view?usp=drive_link',
          'https://drive.google.com/file/d/1pSjXTJSc7qfPlNMfCWdH4io0de-8hZa1/view?usp=drive_link',
          'https://drive.google.com/file/d/1gaQVxTZlp9NF4c9O53c4la5nTRcETLPv/view?usp=drive_link',
          'https://drive.google.com/file/d/1RTMUiLTNjLqHRt7_NYkL8VTBtlfFcfTE/view?usp=drive_link'
        ]
      }
    ]
  },
];

interface ServiceItemCardProps {
  key?: string;
  service: Service;
  index: number;
  hoveredIndex: number | null;
  isCovered?: boolean;
  setHoveredIndex: (idx: number | null) => void;
  onSelectService: (service: Service) => void;
}

function ServiceItemCard({ service, index, hoveredIndex, isCovered, setHoveredIndex, onSelectService }: ServiceItemCardProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const isHovered = hoveredIndex === index;

  const maxTilt = 8;

  useEffect(() => {
    if (!isHovered) {
      setTiltStyle({
        transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: 'transform 0.4s ease-out',
      });
    }
  }, [isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const item = itemRef.current;
    if (!item) return;

    const rect = item.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotateY = x * maxTilt * 2;
    const rotateX = -y * maxTilt * 2;

    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTiltStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
    });
  };

  return (
    <div
      ref={itemRef}
      className="w-full sm:w-[360px] min-h-[56px] cursor-none"
      style={{
        transformStyle: 'preserve-3d',
        ...tiltStyle,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelectService(service)}
    >
      
        
        <div
          className="service-item relative bg-white p-4 px-8 w-full h-full min-h-[56px] flex items-center justify-between transition-all duration-300 rounded-lg shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:shadow-[0_0_15px_rgba(27,242,163,0.3)] hover:border-brand-green overflow-hidden cursor-none"
        >
          <div className="relative z-10 flex-1">
            <div className={`font-sans font-bold text-sm transition-all duration-300 transform origin-left select-none ${
              isHovered ? 'tracking-wider text-brand-green' : 'text-brand-red tracking-wide'
            }`}>
              {service.name}
            </div>
          </div>

          {/* Glowing hover inner shadow */}
          <div
            className={`absolute inset-[1.5px] pointer-events-none transition-opacity duration-300 shadow-[inset_0_0_30px_6px_rgba(27,242,163,0.25)] z-0 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
        
      
    </div>
  );
}

export default function ServicesSection({ isVisible, isCovered, onBackToProjects, customLogo, onOpenProject, onGoHome }: ServicesSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const [textBounds, setTextBounds] = useState<TextBounds | null>(null);

  const handleHoverIndexChange = (index: number | null) => {
    setHoveredIndex(index);
    if (index !== null) {
      setActiveServiceIndex(index);
    }
  };

  useEffect(() => {
    const updateBounds = () => {
      if (descriptionRef.current) {
        const rect = descriptionRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTextBounds({
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            centerY: rect.top + rect.height / 2,
          });
        }
      }
    };
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [activeServiceIndex]);

  const handleGoHome = () => {
    setHoveredIndex(null);
    setActiveServiceIndex(null);
    onGoHome?.();
  };

  const handleBackToProjects = () => {
    setHoveredIndex(null);
    setActiveServiceIndex(null);
    onBackToProjects?.();
  };

  // When leaving the section, disappear the curved stream and reset active service and hover
  useEffect(() => {
    if (!isVisible) {
      setActiveServiceIndex(null);
      setHoveredIndex(null);
      setSelectedService(null);
    }
  }, [isVisible]);

  return (
    <div
      id="services-section-wrapper"
      className={`fixed top-0 left-0 right-0 bottom-0 h-screen overflow-y-auto no-scrollbar bg-transparent z-40 transition-transform duration-750 ease-[cubic-bezier(0.77,0,0.175,1)] flex flex-col justify-between ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* First Screen Viewport: Header + Services Grid & Centerpiece */}
      <div className="min-h-screen flex flex-col justify-between relative shrink-0 overflow-visible">
        {/* Full-viewport Curved Stream of Project Preview Images (No clipping boxes) */}
        <CurvedProjectStream
          projects={activeServiceIndex !== null ? (SERVICES[activeServiceIndex].projects || []) : []}
          isVisible={isVisible && activeServiceIndex !== null && !selectedService}
          textBounds={textBounds}
          onOpenProject={onOpenProject}
        />

        {/* Top Header Bar for Services Section - Sin Relleno (bg-transparent) */}
        <div className="px-6 md:px-10 py-4 flex items-center justify-between bg-transparent z-30 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-sans text-lg md:text-xl font-black text-brand-red uppercase tracking-tight">
              Servicios
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={handleGoHome}
                className="font-sans text-[11px] font-bold tracking-wider uppercase transition-all duration-300 bg-white text-brand-red px-4 py-2 rounded-lg cursor-none flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:text-brand-green hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
              >
                Inicio
              </button>
              <button
                onClick={handleBackToProjects}
                className="font-sans text-[11px] font-bold tracking-wider uppercase transition-all duration-300 bg-white text-brand-red px-4 py-2 rounded-lg cursor-none flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:text-brand-green hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
              >
                ↑ Volver a Proyectos
              </button>
            </div>
          </div>
        </div>

        {/* Main content middle area */}
        <div className="flex-1 w-full relative flex flex-col justify-center min-h-[70vh]">
          {/* Services Grid (Left pane of content) */}
          <section className="w-full px-6 md:px-16 lg:px-24 max-w-4xl z-20 relative flex flex-col justify-center">
            <div 
              className="flex flex-col gap-4 items-start select-none"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {SERVICES.map((service, index) => (
                <ServiceItemCard
                  key={service.id}
                  service={service}
                  index={index}
                  hoveredIndex={hoveredIndex}
                  isCovered={isCovered || !!selectedService}
                  setHoveredIndex={handleHoverIndexChange}
                  onSelectService={setSelectedService}
                />
              ))}
            </div>
          </section>

          {/* Hovered/Active Service Description on the Opposite Side (Right Edge, Vertically Centered) */}
          <div ref={descriptionRef} className="absolute right-6 md:right-16 lg:right-24 top-1/2 -translate-y-1/2 z-30 pointer-events-none max-w-xs sm:max-w-sm md:max-w-md">
            <AnimatePresence mode="wait">
              {activeServiceIndex !== null && (
                <motion.div
                  key={activeServiceIndex}
                  initial={{ x: 24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -16, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 22, mass: 0.8 }}
                  className="flex flex-col items-start text-left"
                >
                  <span className="font-sans text-xs md:text-sm font-black text-brand-red tracking-[0.2em] uppercase block mb-1.5 select-none">
                    {SERVICES[activeServiceIndex].name}
                  </span>
                  <p className="font-sans text-sm md:text-base lg:text-lg font-bold text-black leading-relaxed select-none">
                    {SERVICES[activeServiceIndex].description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Indicador para desplazar hacia el Footer */}
        <div className="py-4 pb-6 flex flex-col items-center justify-center gap-1 pointer-events-none z-20">
          <span className="font-sans text-[10px] font-bold text-brand-red tracking-[0.15em] uppercase">
            Scroll ↓
          </span>
        </div>
      </div>

      {/* Second Screen Viewport: Expanded Footer / Contact Panel */}
      <footer className="min-h-[60vh] md:min-h-[70vh] py-16 px-6 md:px-16 lg:px-24 flex flex-col md:flex-row justify-between items-center gap-8 z-10 bg-white/95 backdrop-blur-xs border-t border-transparent/20 shrink-0">
        <a
          className="footer-cta font-sans text-3xl md:text-5xl font-black tracking-tight transition-colors duration-300 cursor-none"
          href="mailto:c.clavera.c@gmail.com"
        >
          Hablemos →
        </a>

        <div className="flex flex-col items-center md:items-end gap-4 text-center md:text-right">
          <div className="flex gap-6">
            <a
              href="mailto:c.clavera.c@gmail.com"
              className="font-sans text-xs font-bold transition-colors duration-300 tracking-wider uppercase cursor-none"
            >
              Email
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs font-bold transition-colors duration-300 tracking-wider uppercase cursor-none"
            >
              Instagram
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs font-bold transition-colors duration-300 tracking-wider uppercase cursor-none"
            >
              LinkedIn
            </a>
          </div>
          <div className="font-sans text-xs font-bold text-brand-blue tracking-wide">
            2026 © Camilo Clavera — Montevideo, Uruguay
          </div>
        </div>
      </footer>

      {/* Fullscreen Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          services={SERVICES}
          onClose={() => setSelectedService(null)}
          onSelectService={setSelectedService}
          onOpenProject={onOpenProject}
          isCovered={isCovered}
          onGoHome={() => {
            setSelectedService(null);
            if (onGoHome) onGoHome();
          }}
        />
      )}
    </div>
  );
}
