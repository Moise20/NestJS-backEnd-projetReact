// [LEARN] Render (comme Netlify/Heroku) a un disque éphémère : tout fichier écrit
// [LEARN] localement (fs.writeFile) disparaît au prochain redéploiement/redémarrage.
// [LEARN] Cloudinary est un stockage d'images externe et persistant — on lui envoie
// [LEARN] le buffer de l'image, il nous renvoie une URL stable (https://res.cloudinary.com/...)
// [LEARN] qu'on stocke en base à la place d'un chemin local.
// [LEARN] Parallèle Angular/Spring : c'est l'équivalent d'un service qui appelle un
// [LEARN] bucket S3 depuis le backend plutôt que d'écrire sur le disque du serveur.
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'ecommerce-blog',
    });
    return result.secure_url;
  }
}
