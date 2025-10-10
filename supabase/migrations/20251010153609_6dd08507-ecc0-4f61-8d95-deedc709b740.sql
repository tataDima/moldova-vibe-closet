-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
);

-- Create bids table
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'counter_offered', 'counter_accepted', 'counter_rejected')),
  counter_amount NUMERIC CHECK (counter_amount > 0),
  counter_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on bids
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Bids policies
CREATE POLICY "Users can view their own bids"
ON public.bids FOR SELECT
USING (auth.uid() = bidder_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create bids"
ON public.bids FOR INSERT
WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "Sellers can update bids on their listings"
ON public.bids FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Bidders can update counter offers"
ON public.bids FOR UPDATE
USING (
  auth.uid() = bidder_id 
  AND status = 'counter_offered'
);

-- Trigger for updated_at on bids
CREATE TRIGGER update_bids_updated_at
BEFORE UPDATE ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Index for faster queries
CREATE INDEX idx_bids_listing_id ON public.bids(listing_id);
CREATE INDEX idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX idx_bids_seller_id ON public.bids(seller_id);
CREATE INDEX idx_bids_status ON public.bids(status);