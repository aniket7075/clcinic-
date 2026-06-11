import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    // Fetch user profile to get the role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      res.status(404).json({ error: 'User profile not found', details: profileError });
      return;
    }

    res.status(200).json({
      message: 'Login successful',
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile.role,
        firstName: profile.first_name,
        lastName: profile.last_name,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.status(200).json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error fetching profile' });
  }
};
