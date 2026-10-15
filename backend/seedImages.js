import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import Product from "./models/product.model.js";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.log("DNS warning:", e.message);
}

dotenv.config();

const productImages = [
  {
    nameMatch: /keyboard/i,
    image: "/images/products/mechanical-keyboard.jpg"
  },
  {
    nameMatch: /mouse/i,
    image: "/images/products/wireless-mouse.jpg"
  },
  {
    nameMatch: /lamp/i,
    image: "/images/products/led-desk-lamp.jpg"
  },
  {
    nameMatch: /speaker/i,
    image: "/images/products/bluetooth-speaker.jpg"
  }
];

const specificUpdates = [
  {
    id: "6ab4cdc12efdd5677f3e8507",
    image: "/images/products/mechanical-keyboard.jpg"
  },
  {
    id: "6ab4cf1f2efdd5677f3e8508",
    image: "/images/products/wireless-mouse.jpg"
  },
  {
    id: "6ab4cf2c2efdd5677f3e8509",
    image: "/images/products/running-shoes-red.jpg"
  },
  {
    id: "6ab4cf4e2efdd5677f3e850a",
    image: "/images/products/led-desk-lamp.jpg"
  },
  {
    id: "6ab4cf542efdd5677f3e850b",
    image: "/images/products/bluetooth-speaker.jpg"
  },
  {
    id: "6ab4db26094f0fd27c4898c6",
    image: "/images/products/running-shoes-white.jpg"
  }
];

async function updateProductImages() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // First apply by specific ID
    for (const update of specificUpdates) {
      const res = await Product.findByIdAndUpdate(
        update.id,
        { image: update.image },
        { new: true }
      );
      if (res) {
        console.log(`Updated [${res.name}] (ID: ${update.id}) -> ${res.image}`);
      }
    }

    // Also update any remaining products that match name
    const allProducts = await Product.find({});
    for (const p of allProducts) {
      if (!p.image || p.image.includes("placehold.co") || p.image.includes("example.com")) {
        let matchedImage = "/images/products/mechanical-keyboard.jpg";
        for (const rule of productImages) {
          if (rule.nameMatch.test(p.name)) {
            matchedImage = rule.image;
            break;
          }
        }
        if (/shoe|sneaker/i.test(p.name)) {
          matchedImage = "/images/products/running-shoes-red.jpg";
        }
        p.image = matchedImage;
        await p.save();
        console.log(`Fallback updated [${p.name}] -> ${p.image}`);
      }
    }

    console.log("\nAll product images have been updated successfully!");
    const updated = await Product.find({}, "name image category price");
    console.log(JSON.stringify(updated, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error updating product images:", error);
    process.exit(1);
  }
}

updateProductImages();
