// const geminiService = require("../services/geminiService");
// const firestoreService = require("../services/firestoreService");

// class CareerController {
//   async generateRecommendations(req, res) {
//     try {
//       const { uid } = req.user;
//       const userProfile = req.body;

//       // Get or create user profile
//       let user = await firestoreService.getUser(uid);
//       if (!user) {
//         await firestoreService.createUser(uid, userProfile);
//         user = userProfile;
//       } else {
//         // Update user profile
//         await firestoreService.updateUser(uid, { preferences: userProfile.preferences });
//       }

//       // Generate AI recommendations
//       const recommendations = await geminiService.generateCareerRecommendations(userProfile);

//       // Save recommendations to Firestore
//       const savedRecommendations = await firestoreService.saveCareerRecommendations(uid, recommendations);

//       res.status(200).json({
//         success: true,
//         data: {
//           recommendationId: savedRecommendations.id,
//           recommendations
//         }
//       });
//     } catch (error) {
//       console.error("Error in generateRecommendations:", error);
//       res.status(500).json({
//         success: false,
//         error: "Failed to generate career recommendations"
//       });
//     }
//   }

//   async getRecommendations(req, res) {
//     try {
//       const { uid } = req.user;
//       const recommendations = await firestoreService.getCareerRecommendations(uid);

//       if (!recommendations) {
//         return res.status(404).json({
//           success: false,
//           error: "No recommendations found"
//         });
//       }

//       res.status(200).json({
//         success: true,
//         data: recommendations
//       });
//     } catch (error) {
//       console.error("Error in getRecommendations:", error);
//       res.status(500).json({
//         success: false,
//         error: "Failed to fetch recommendations"
//       });
//     }
//   }
// }

// module.exports = new CareerController();