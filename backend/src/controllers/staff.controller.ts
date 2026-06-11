import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';

// Helper to generate a random password if not provided
const generatePassword = () => Math.random().toString(36).slice(-10) + 'A1!';

export const createStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, role, firstName, lastName, mobile, employeeId, designation, salary, joiningDate, avatarUrl } = req.body;

  if (!email || !role || !firstName || !lastName || !employeeId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const userPassword = password || generatePassword();
    
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
    });

    if (authError) {
      res.status(400).json({ error: authError.message });
      return;
    }

    const userId = authData.user.id;

    // 2. Insert into profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      clinic_id: req.user.clinic_id,
      role: role,
      first_name: firstName,
      last_name: lastName,
      mobile: mobile || null,
      email: email,
      avatar_url: avatarUrl || null,
    });

    if (profileError) {
      // Rollback auth user creation if profile fails
      await supabase.auth.admin.deleteUser(userId);
      res.status(400).json({ error: profileError.message });
      return;
    }

    // 3. Insert into staff
    const { data: staffData, error: staffError } = await supabase.from('staff').insert({
      profile_id: userId,
      clinic_id: req.user.clinic_id,
      employee_id: employeeId,
      designation: designation || role,
      salary: salary || 0,
      joining_date: joiningDate || new Date().toISOString().split('T')[0],
    }).select().single();

    if (staffError) {
      // Note: Full rollback might be complex in a real app, keeping it simple here
      res.status(400).json({ error: staffError.message });
      return;
    }

    res.status(201).json({ 
      message: 'Staff created successfully', 
      staff: staffData,
      temporaryPassword: password ? null : userPassword 
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error creating staff' });
  }
};

export const getStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select(`
        *,
        profiles (
          id,
          role,
          first_name,
          last_name,
          email,
          mobile,
          avatar_url
        )
      `)
      .eq('clinic_id', req.user.clinic_id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ staff: data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error fetching staff' });
  }
};

export const updateStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params; // This is the staff table ID
  const { role, firstName, lastName, mobile, designation, salary, avatarUrl } = req.body;

  try {
    // Get profile_id first
    const { data: staffRecord, error: fetchError } = await supabase
      .from('staff')
      .select('profile_id')
      .eq('id', id)
      .eq('clinic_id', req.user.clinic_id)
      .single();

    if (fetchError || !staffRecord) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }

    const profileId = staffRecord.profile_id;

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role,
        first_name: firstName,
        last_name: lastName,
        mobile,
        avatar_url: avatarUrl
      })
      .eq('id', profileId);

    if (profileError) {
      res.status(400).json({ error: profileError.message });
      return;
    }

    // Update staff
    const { error: staffError } = await supabase
      .from('staff')
      .update({
        designation,
        salary
      })
      .eq('id', id);

    if (staffError) {
      res.status(400).json({ error: staffError.message });
      return;
    }

    res.status(200).json({ message: 'Staff updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error updating staff' });
  }
};

export const deleteStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Staff ID

  try {
    // Get profile_id first
    const { data: staffRecord, error: fetchError } = await supabase
      .from('staff')
      .select('profile_id')
      .eq('id', id)
      .eq('clinic_id', req.user.clinic_id)
      .single();

    if (fetchError || !staffRecord) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }

    // Delete user from Supabase Auth (which cascades to profiles and staff)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(staffRecord.profile_id);

    if (deleteError) {
      res.status(400).json({ error: deleteError.message });
      return;
    }

    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error deleting staff' });
  }
};

// --- Attendance ---
export const getAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { staffId, date } = req.query;
  try {
    let query = supabase.from('staff_attendance').select('*').eq('clinic_id', req.user.clinic_id);
    if (staffId) query = query.eq('staff_id', staffId);
    if (date) query = query.eq('date', date);

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { staffId, date, status, checkIn, checkOut, notes } = req.body;
  try {
    const { data, error } = await supabase
      .from('staff_attendance')
      .upsert({ clinic_id: req.user.clinic_id, staff_id: staffId, date, status, check_in: checkIn, check_out: checkOut, notes }, { onConflict: 'staff_id,date' })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// --- Leaves ---
export const getLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  const { staffId } = req.query;
  try {
    let query = supabase.from('staff_leaves').select('*, staff(profiles(first_name, last_name))').eq('clinic_id', req.user.clinic_id);
    if (staffId) query = query.eq('staff_id', staffId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const applyLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  const { staffId, startDate, endDate, reason, type } = req.body;
  try {
    const { data, error } = await supabase
      .from('staff_leaves')
      .insert([{ clinic_id: req.user.clinic_id, staff_id: staffId, start_date: startDate, end_date: endDate, reason, type }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, approvedBy } = req.body;
  try {
    const { data, error } = await supabase
      .from('staff_leaves')
      .update({ status, approved_by: approvedBy })
      .eq('id', id)
      .eq('clinic_id', req.user.clinic_id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// --- Schedules ---
export const getSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  const { doctorId } = req.query;
  try {
    let query = supabase.from('doctor_schedules').select('*, profiles(first_name, last_name)').eq('clinic_id', req.user.clinic_id);
    if (doctorId) query = query.eq('doctor_id', doctorId);

    const { data, error } = await query.order('day_of_week', { ascending: true });
    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { doctorId, schedules } = req.body; // schedules is an array of { dayOfWeek, startTime, endTime, isAvailable }
  try {
    // Delete existing schedules for this doctor to simplify upsert
    await supabase.from('doctor_schedules').delete().eq('doctor_id', doctorId).eq('clinic_id', req.user.clinic_id);
    
    if (schedules && schedules.length > 0) {
      const inserts = schedules.map((s: any) => ({
        clinic_id: req.user.clinic_id,
        doctor_id: doctorId,
        day_of_week: s.dayOfWeek,
        start_time: s.startTime,
        end_time: s.endTime,
        is_available: s.isAvailable
      }));

      const { data, error } = await supabase.from('doctor_schedules').insert(inserts).select();
      if (error) throw error;
      res.status(200).json(data);
    } else {
      res.status(200).json({ message: 'Schedules cleared' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

