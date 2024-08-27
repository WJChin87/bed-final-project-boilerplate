import { Router } from "express";
import getProperties from "../services/properties/getProperties.js";
import createProperty from "../services/properties/createProperty.js";
import getPropertyById from "../services/properties/getPropertyById.js";
import deletePropertyById from "../services/properties/deletePropertyById.js";
import updatePropertyById from "../services/properties/updatePropertyById.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { location, pricePerNight } = req.query;
    const pricePerNightFloat = parseFloat(pricePerNight);
    const properties = await getProperties(location, pricePerNightFloat);

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error in /properties endpoint:", error);
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const requiredFields = [
      "location",
      "description",
      "pricePerNight",
      "bedroomCount",
      "bathRoomCount",
      "maxGuestCount",
      "hostId",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    const {
      title,
      location,
      description,
      pricePerNight,
      bedroomCount,
      bathRoomCount,
      maxGuestCount,
      hostId,
    } = req.body;

    const newProperty = await createProperty(
      title,
      location,
      description,
      pricePerNight,
      bedroomCount,
      bathRoomCount,
      maxGuestCount,
      hostId
    );

    if (!newProperty) {
      throw new Error(
        "Failed to create property. Please check the request data."
      );
    }

    res.status(201).json({
      message: `Property with id ${newProperty.id} successfully added`,
      property: newProperty,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/:id", async (req, res, next) => {
  console.log("req.params:", req.params);
  try {
    const { id } = req.params;
    const property = await getPropertyById(id);

    if (!property) {
      res.status(404).json({ message: `Property with id ${id} not found` });
    } else {
      res.status(200).json(property);
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProperty = await deletePropertyById(id);
    if (!deletedProperty) {
      res.status(404).json({ message: `Property with id ${id} not found` });
    } else {
      res.status(200).json({ message: `Property with id ${id} deleted` });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updatedPropertyData = req.body;
  const updatedPropertyById = await updatePropertyById(id, updatedPropertyData);

  if (updatedPropertyById) {
    res.status(200).json({
      message: `Property with id ${id} successfully updated`,
      updatedPropertyById,
    });
  } else {
    return res.status(404).json({
      message: `Property with id ${id} not found`,
    });
  }
});

export default router;
