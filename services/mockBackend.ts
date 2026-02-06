import { User, PlanType, GenerationHistory, Concept, ShowcaseItem } from "../types";
import { imageDb } from "./imageDb";

const DB_KEY = "nexus_vision_db_v1";
const CURRENT_USER_KEY = "nexus_vision_current_user";
const SHOWCASE_KEY = "nexus_vision_showcase_v1";
const HERO_EXAMPLE_KEY = "nexus_vision_hero_example_id";
const HERO_EXAMPLE_CAPTION_KEY = "nexus_vision_hero_caption_v1";
const HERO_EXAMPLE_INPUT_KEY = "nexus_vision_hero_input_v1";
const HERO_EXAMPLE_PROMPT_KEY = "nexus_vision_hero_prompt_v1";

// Mock Database Structure
interface MockDB {
  users: User[];
  histories: Record<string, GenerationHistory[]>; // userId -> History[]
}

// Initialize DB
const getDB = (): MockDB => {
  const db = localStorage.getItem(DB_KEY);
  if (!db) {
    const initial = { users: [], histories: {} };
    localStorage.setItem(DB_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(db);
};

const saveDB = (db: MockDB) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// --- AUTH SERVICES ---

export const loginUser = async (email: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 800));
  
  // Backdoor Admin (Credenciais Atualizadas)
  if (email === 'ttechinovacao@gmail.com' && password === 'Shtphgal&9596') {
     const adminUser: User = {
        id: 'admin-id',
        name: 'T-Tech Inovação (Admin)',
        email: 'ttechinovacao@gmail.com',
        credits: Infinity,
        plan: 'ultra',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        isAdmin: true
     };
     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
     return adminUser;
  }

  const db = getDB();
  const user = db.users.find(u => u.email === email);
  
  if (!user) throw new Error("Usuário não encontrado.");
  // In a real app, we would hash/check password here.
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  await new Promise(r => setTimeout(r, 1000));
  
  const db = getDB();
  if (db.users.find(u => u.email === email)) {
    throw new Error("Este email já está cadastrado.");
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    plan: 'free',
    credits: 5, // Updated to 5 Free Generations
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
  };

  db.users.push(newUser);
  saveDB(db);
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const u = localStorage.getItem(CURRENT_USER_KEY);
  return u ? JSON.parse(u) : null;
};

// --- PAYMENT SERVICES (Stripe Mock) ---

// Updated Plans: Credits adjusted & Annual plans added (15% discount)
export const PLANS: Record<PlanType, { price: number, credits: number, name: string }> = {
  free: { price: 0, credits: 5, name: 'Livre' },
  
  // Monthly (Opção 3 - Balanceada)
  starter: { price: 49, credits: 75, name: 'Iniciante' },
  pro: { price: 129, credits: 250, name: 'Pró' },
  ultra: { price: 299, credits: 750, name: 'Ultra' },

  // Annual (Price = Monthly * 12 * 0.85) | Credits = Monthly * 12 (Bulk discount)
  starter_yearly: { price: 499, credits: 900, name: 'Iniciante Anual' }, // 49 * 12 * 0.85
  pro_yearly: { price: 1318, credits: 3000, name: 'Pró Anual' }, // 129 * 12 * 0.85
  ultra_yearly: { price: 3059, credits: 9000, name: 'Ultra Anual' } // 299 * 12 * 0.85
};

export const processPayment = async (userId: string, plan: PlanType): Promise<User> => {
  await new Promise(r => setTimeout(r, 2000)); // Simulate Stripe processing
  
  const db = getDB();
  const userIndex = db.users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) throw new Error("User not found");
  
  const selectedPlan = PLANS[plan];
  
  // Update User
  db.users[userIndex].plan = plan;
  
  // Strategy: Buying a plan ADDS credits to current balance
  // All plans now have specific credit limits (no more Infinity)
  const current = db.users[userIndex].credits;
  db.users[userIndex].credits = current + selectedPlan.credits;
  
  saveDB(db);
  const updatedUser = db.users[userIndex];
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  
  return updatedUser;
};

export const deductCredit = async (userId: string): Promise<User> => {
  const db = getDB();
  const userIndex = db.users.findIndex(u => u.id === userId);
  
  if (userIndex === -1 && userId !== 'admin-id') throw new Error("User not found");
  if (userId === 'admin-id') return getCurrentUser()!; // Admin has Infinity

  const user = db.users[userIndex];
  
  if (user.credits <= 0) throw new Error("Créditos insuficientes.");
  
  user.credits -= 1;
  saveDB(db);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

// --- HISTORY SERVICES ---

export const saveHistory = async (
  userId: string, 
  niche: string, 
  theme: string, 
  concepts: Concept[],
  images: {
    baseImage: string | null;
    styleImage: string | null;
    productImage: string | null;
  }
) => {
  
  // 1. Save images to IndexedDB first
  let baseImageId, styleImageId, productImageId;

  if (images.baseImage) {
    baseImageId = await imageDb.saveImage(images.baseImage);
  }
  if (images.styleImage) {
    styleImageId = await imageDb.saveImage(images.styleImage);
  }
  if (images.productImage) {
    productImageId = await imageDb.saveImage(images.productImage);
  }

  // 2. Save metadata to LocalStorage (MockDB)
  const db = getDB();
  if (!db.histories[userId]) db.histories[userId] = [];
  
  db.histories[userId].unshift({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    niche,
    theme,
    baseImageId,
    styleImageId,
    productImageId,
    concepts
  });
  
  saveDB(db);
};

export const getUserHistory = async (userId: string): Promise<GenerationHistory[]> => {
  const db = getDB();
  return db.histories[userId] || [];
};

// Helper to re-hydrate images (if needed for UI later)
export const hydrateHistoryItem = async (item: GenerationHistory) => {
  const baseImage = item.baseImageId ? await imageDb.getImage(item.baseImageId) : null;
  const styleImage = item.styleImageId ? await imageDb.getImage(item.styleImageId) : null;
  const productImage = item.productImageId ? await imageDb.getImage(item.productImageId) : null;
  
  return {
    ...item,
    images: { baseImage, styleImage, productImage }
  };
};

// --- SHOWCASE / ADMIN SERVICES ---

export const getShowcaseItems = async (): Promise<ShowcaseItem[]> => {
  const raw = localStorage.getItem(SHOWCASE_KEY);
  const items: ShowcaseItem[] = raw ? JSON.parse(raw) : [];
  
  // Hydrate with real images from IDB
  const hydrated = await Promise.all(items.map(async (item) => {
    const imageData = await imageDb.getImage(item.imageId);
    return { ...item, imageUrl: imageData || undefined };
  }));
  
  return hydrated.filter(item => item.imageUrl); // Filter out broken/missing images
};

// Function kept for backward compatibility/single usage
export const addShowcaseItem = async (title: string, category: string, base64Image: string, row: 'top' | 'bottom') => {
  const imageId = await imageDb.saveImage(base64Image);
  
  const raw = localStorage.getItem(SHOWCASE_KEY);
  const items: ShowcaseItem[] = raw ? JSON.parse(raw) : [];
  
  const newItem: ShowcaseItem = {
    id: crypto.randomUUID(),
    title,
    category,
    imageId,
    row
  };
  
  items.unshift(newItem); 
  localStorage.setItem(SHOWCASE_KEY, JSON.stringify(items));
  return newItem;
};

// New function for Bulk Upload
export const addBulkShowcaseItems = async (images: string[], row: 'top' | 'bottom') => {
  const raw = localStorage.getItem(SHOWCASE_KEY);
  const items: ShowcaseItem[] = raw ? JSON.parse(raw) : [];

  // Process all images
  const newItems = await Promise.all(images.map(async (base64Image) => {
    const imageId = await imageDb.saveImage(base64Image);
    return {
      id: crypto.randomUUID(),
      title: "", // Empty as requested
      category: "", // Empty as requested
      imageId,
      row
    } as ShowcaseItem;
  }));
  
  // Add all new items to the start of the list
  items.unshift(...newItems);
  localStorage.setItem(SHOWCASE_KEY, JSON.stringify(items));
  return newItems;
};

export const deleteShowcaseItem = async (id: string, imageId: string) => {
  // 1. Remove from LocalStorage
  const raw = localStorage.getItem(SHOWCASE_KEY);
  if (raw) {
    const items: ShowcaseItem[] = JSON.parse(raw);
    const newItems = items.filter(i => i.id !== id);
    localStorage.setItem(SHOWCASE_KEY, JSON.stringify(newItems));
  }
  
  // 2. Clean from IndexedDB (optional but good practice)
  try {
    await imageDb.deleteImage(imageId);
  } catch (e) {
    console.error("Error deleting image from IDB", e);
  }
};

// --- HERO EXAMPLE IMAGE SERVICE ---

export const saveHeroExampleImage = async (base64Image: string) => {
  // Save to IDB
  const imageId = await imageDb.saveImage(base64Image);
  // Save reference ID to local storage
  localStorage.setItem(HERO_EXAMPLE_KEY, imageId);
  return imageId;
};

export const getHeroExampleImage = async (): Promise<string | null> => {
  const imageId = localStorage.getItem(HERO_EXAMPLE_KEY);
  if (!imageId) return null;
  return await imageDb.getImage(imageId);
};

export const saveHeroExampleDetails = (input: string, prompt: string, caption: string) => {
  localStorage.setItem(HERO_EXAMPLE_INPUT_KEY, input);
  localStorage.setItem(HERO_EXAMPLE_PROMPT_KEY, prompt);
  localStorage.setItem(HERO_EXAMPLE_CAPTION_KEY, caption);
};

export const getHeroExampleDetails = () => {
  return {
    input: localStorage.getItem(HERO_EXAMPLE_INPUT_KEY) || "Quero uma imagem do The Rock preparando um shake de proteína, estilo futurista, luz neon roxa e azul, fumaça saindo do pote, alta definição.",
    prompt: localStorage.getItem(HERO_EXAMPLE_PROMPT_KEY) || "Hyper-realistic portrait of Dwayne 'The Rock' Johnson pouring glowing red protein powder into a metallic shaker. Cyberpunk gym atmosphere with intense purple and blue neon rim lights. Volumetric fog, sweat texture on skin, focus on the muscular vascularity. 8k resolution, cinematic composition, octane render.",
    caption: localStorage.getItem(HERO_EXAMPLE_CAPTION_KEY) || "O momento é agora. Pare de esperar, comece a construir. The Rock está te mostrando como. Nossa maior PROMOÇÃO do ano está LIBERADA! Clique no link e use o código POWERUP para garantir seu desconto. #PowerUpNow #TheRock #PromoDeVerdade #CyberGym"
  };
};

export const saveHeroExampleCaption = (caption: string) => { // Legacy support/Wrapper
  localStorage.setItem(HERO_EXAMPLE_CAPTION_KEY, caption);
};

export const getHeroExampleCaption = (): string => { // Legacy support/Wrapper
  return getHeroExampleDetails().caption;
};