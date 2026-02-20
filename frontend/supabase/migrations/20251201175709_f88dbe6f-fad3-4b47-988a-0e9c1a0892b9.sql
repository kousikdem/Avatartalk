-- Enable REPLICA IDENTITY FULL for real-time sync on orders table
ALTER TABLE orders REPLICA IDENTITY FULL;