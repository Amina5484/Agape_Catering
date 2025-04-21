import Stock from '../models/stock.js';
import Schedule from '../models/schedule.js';

// STOCK MANAGEMENT
export const updateStockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const stockItem = await Stock.findById(id);
    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }
    if (quantity > stockItem.quantity) {
      return res
        .status(400)
        .json({ message: 'Quantity to decrement exceeds available stock' });
    }

    const updatedStock = await Stock.findByIdAndUpdate(
      id,
      { $inc: { quantity: -quantity } },
      { new: true }
    );
    res.status(200).json({ message: 'Stock updated', updatedStock });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getStock = async (req, res) => {
  try {
    console.log('Fetching stock for chef');
    const stock = await Stock.find();
    console.log('Found stock items:', stock.length);
    res.status(200).json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock',
      error: error.message,
    });
  }
};

// scheduleSchema MANAGEMENT

export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(200).json({ message: 'Schedule not found' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
