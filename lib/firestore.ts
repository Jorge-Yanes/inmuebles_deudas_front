import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

export async function getAssetTypes(): Promise<string[]> {
  try {
    const propertiesRef = collection(db, "properties")
    const querySnapshot = await getDocs(propertiesRef)

    const types = new Set<string>()
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.type) {
        types.add(data.type)
      }
    })

    return Array.from(types).sort()
  } catch (error) {
    console.error("Error getting asset types:", error)
    return []
  }
}

export async function getProvinces(): Promise<string[]> {
  try {
    const propertiesRef = collection(db, "properties")
    const querySnapshot = await getDocs(propertiesRef)

    const provinces = new Set<string>()
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.province) {
        provinces.add(data.province)
      }
    })

    return Array.from(provinces).sort()
  } catch (error) {
    console.error("Error getting provinces:", error)
    return []
  }
}

export async function getPortfolios(): Promise<string[]> {
  try {
    return ["Portfolio A", "Portfolio B", "Portfolio C"]
  } catch (error) {
    console.error("Error getting portfolios:", error)
    return []
  }
}

export async function createAsset(assetData: any): Promise<string | null> {
  console.log("createAsset is a stub")
  return null
}
