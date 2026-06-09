import UserModel from '../models/User.js';

/**
 * 1. REGISTER SWIMMER SUB-PROFILE
 * POST /api/profiles/register
 */
export const registerProfile = async (req, res) => {
  try {
    const { swimmerType, fullName, age, skillLevel, medicalDeclarations, guardianName, guardianContact } = req.body;

    // A. Common Field Validations
    if (!swimmerType || !['Adult', 'Child'].includes(swimmerType)) {
      return res.status(400).json({ success: false, message: "Validation Failed: swimmerType must be 'Adult' or 'Child'." });
    }
    if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
      return res.status(400).json({ success: false, message: "Validation Failed: fullName is a mandatory text field." });
    }
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge <= 0) {
      return res.status(400).json({ success: false, message: "Validation Failed: age must be a positive integer." });
    }
    if (!skillLevel || !['Beginner', 'Intermediate', 'Elite'].includes(skillLevel)) {
      return res.status(400).json({ success: false, message: "Validation Failed: skillLevel must be 'Beginner', 'Intermediate', or 'Elite'." });
    }

    // B. Safety Gateways: Guardian Enforcements for Children
    const isChild = parsedAge < 18 || swimmerType === 'Child';
    if (isChild) {
      if (!guardianName || typeof guardianName !== 'string' || guardianName.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          message: "🔒 Safety Guard Activated: Child swimmers require a parent or legal guardian's full name to complete registration." 
        });
      }
      if (!guardianContact || typeof guardianContact !== 'string' || guardianContact.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          message: "🔒 Safety Guard Activated: A valid parent or guardian contact number is mandatory for child safety tracking." 
        });
      }
    }

    // Fetch parent user account
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    // Ensure profiles array is initialized
    if (!user.profiles) {
      user.profiles = [];
    }

    // Check for duplicate profile name case-insensitively
    const isDuplicate = (user.profiles || []).some(
      p => p.fullName.trim().toLowerCase() === fullName.trim().toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ 
        success: false, 
        message: `⚠️ Swimmer profile with name "${fullName}" is already registered under your account.` 
      });
    }

    // Generate unique ID for sub-profile (Mongoose handles automatically, mock DB needs it explicitly)
    const newProfileId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const newProfile = {
      _id: newProfileId,
      swimmerType: isChild ? 'Child' : swimmerType,
      fullName: fullName.trim(),
      age: parsedAge,
      skillLevel,
      medicalDeclarations: medicalDeclarations || '',
      guardianName: isChild ? guardianName.trim() : undefined,
      guardianContact: isChild ? guardianContact.trim() : undefined,
      createdAt: new Date()
    };

    user.profiles.push(newProfile);

    // Save user profiles
    await UserModel.findByIdAndUpdate(req.user._id, { profiles: user.profiles });

    return res.status(201).json({
      success: true,
      message: "🎉 Swimmer profile registered successfully!",
      profile: newProfile
    });
  } catch (error) {
    console.error("Error registering swimmer profile:", error);
    return res.status(500).json({ success: false, message: "Internal server error registering swimmer profile." });
  }
};

/**
 * 2. GET SWIMMER SUB-PROFILES
 * GET /api/profiles
 */
export const getProfiles = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    // Clean up/filter duplicates by name dynamically in return list
    const uniqueProfiles = [];
    const seenNames = new Set();
    
    (user.profiles || []).forEach(p => {
      const nameKey = p.fullName.trim().toLowerCase();
      if (!seenNames.has(nameKey)) {
        seenNames.add(nameKey);
        uniqueProfiles.push(p);
      }
    });

    return res.json({
      success: true,
      profiles: uniqueProfiles
    });
  } catch (error) {
    console.error("Error fetching swimmer profiles:", error);
    return res.status(500).json({ success: false, message: "Internal server error loading profiles." });
  }
};

/**
 * 3. UPDATE SWIMMER SUB-PROFILE
 * PUT /api/profiles/update/:profileId
 */
export const updateProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { swimmerType, fullName, age, skillLevel, medicalDeclarations, guardianName, guardianContact } = req.body;

    // Fetch parent user account
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const profiles = user.profiles || [];
    const profileIndex = profiles.findIndex(p => p._id.toString() === profileId);

    if (profileIndex === -1) {
      return res.status(404).json({ success: false, message: "Swimmer profile not found." });
    }

    const profile = profiles[profileIndex];

    // Update fields if provided in request body
    if (fullName !== undefined) {
      if (fullName.trim() === '') {
        return res.status(400).json({ success: false, message: "Validation Failed: Full name cannot be empty." });
      }
      profile.fullName = fullName.trim();
    }

    if (age !== undefined) {
      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge <= 0) {
        return res.status(400).json({ success: false, message: "Validation Failed: Age must be a positive integer." });
      }
      profile.age = parsedAge;
    }

    if (swimmerType !== undefined) {
      if (!['Adult', 'Child'].includes(swimmerType)) {
        return res.status(400).json({ success: false, message: "Validation Failed: swimmerType must be 'Adult' or 'Child'." });
      }
      profile.swimmerType = swimmerType;
    }

    if (skillLevel !== undefined) {
      if (!['Beginner', 'Intermediate', 'Elite'].includes(skillLevel)) {
        return res.status(400).json({ success: false, message: "Validation Failed: skillLevel must be 'Beginner', 'Intermediate', or 'Elite'." });
      }
      profile.skillLevel = skillLevel;
    }

    if (medicalDeclarations !== undefined) {
      profile.medicalDeclarations = medicalDeclarations.trim();
    }

    // Safety Gateways: Guardian Enforcements for Children
    const isChild = profile.age < 18 || profile.swimmerType === 'Child';
    if (isChild) {
      profile.swimmerType = 'Child'; // Force type compliance for children
      
      const newGuardianName = guardianName !== undefined ? guardianName : profile.guardianName;
      const newGuardianContact = guardianContact !== undefined ? guardianContact : profile.guardianContact;

      if (!newGuardianName || typeof newGuardianName !== 'string' || newGuardianName.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          message: "🔒 Safety Guard Activated: Child swimmers require a parent or legal guardian's full name to complete registration." 
        });
      }
      if (!newGuardianContact || typeof newGuardianContact !== 'string' || newGuardianContact.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          message: "🔒 Safety Guard Activated: A valid parent or guardian contact number is mandatory for child safety tracking." 
        });
      }
      profile.guardianName = newGuardianName.trim();
      profile.guardianContact = newGuardianContact.trim();
    } else {
      // If changed to adult and guardian details are cleared/not needed, they can be updated or set to undefined
      if (guardianName !== undefined) profile.guardianName = guardianName ? guardianName.trim() : undefined;
      if (guardianContact !== undefined) profile.guardianContact = guardianContact ? guardianContact.trim() : undefined;
    }

    user.profiles[profileIndex] = profile;

    // Save updated profiles array back to the user account
    await UserModel.findByIdAndUpdate(req.user._id, { profiles: user.profiles });

    return res.json({
      success: true,
      message: "🎉 Swimmer profile updated successfully!",
      profile
    });
  } catch (error) {
    console.error("Error updating swimmer profile:", error);
    return res.status(500).json({ success: false, message: "Internal server error updating swimmer profile." });
  }
};

