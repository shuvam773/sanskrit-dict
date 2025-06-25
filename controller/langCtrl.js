const Language = require('../models/langModel');

const langCtrl = {
  // GET /api/lang/get
  getLang: async (req, res) => {
    try {
      const result = await Language.find(); // no filter

      res.json({
        success: true,
        count: result.length,
        result,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error getting all entries',
        success: false,
        error: error.message,
      });
    }
  },

  //GET api/lang/word?word=
  getLangByWord: async (req, res) => {
    try {
      const word = req.query.word?.trim();
      if (!word) {
        return res
          .status(400)
          .json({ success: false, message: "Missing 'word' query parameter" });
      }

      // Search across all relevant fields
      const regex = new RegExp(word, 'i'); // case-insensitive regex
      const results = await Language.find({
        $or: [
          { पद: { $regex: regex } },
          { लिंग: { $regex: regex } },
          { व्याख्या: { $regex: regex } },
          { सन्दर्भ: { $regex: regex } },
          { मराठी_अर्थ: { $regex: regex } },
        ],
      });

      if (results.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: 'No matching entries found' });
      }

      res.json({
        success: true,
        count: results.length,
        results,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error filtering entries by word',
        error: error.message,
      });
    }
  },

  // POST /api/lang/post
  postLang: async (req, res) => {
    try {
      const data = req.body;

      if (Array.isArray(data)) {
        const inserted = await Language.insertMany(data);
        res.json({
          success: true,
          message: `${inserted.length} entries inserted.`,
          inserted,
        });
      } else {
        const inserted = await Language.create(data);
        res.json({
          success: true,
          message: `1 entry inserted.`,
          inserted,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Error inserting entries',
        success: false,
        error: error.message,
      });
    }
  },

  // PUT /api/lang/:id
  updateLang: async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;

      const updatedEntry = await Language.findByIdAndUpdate(id, updates, {
        new: true, // return the updated document
        runValidators: true, // ensure schema validation
      });

      if (!updatedEntry) {
        return res.status(404).json({
          success: false,
          message: 'Entry not found with the provided ID',
        });
      }

      res.json({
        success: true,
        message: 'Entry updated successfully',
        updated: updatedEntry,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating entry',
        error: error.message,
      });
    }
  },
};

module.exports = langCtrl;
