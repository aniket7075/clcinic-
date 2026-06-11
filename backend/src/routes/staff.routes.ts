import { Router } from 'express';
import { 
  createStaff, getStaff, updateStaff, deleteStaff,
  getAttendance, markAttendance,
  getLeaves, applyLeave, updateLeaveStatus,
  getSchedules, updateSchedule
} from '../controllers/staff.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Allow authenticated users to view staff (needed for dropdowns)
router.get('/', getStaff);

// Only admins can modify staff
router.post('/', requireRole(['SUPER_ADMIN', 'CLINIC_ADMIN']), createStaff);
router.put('/:id', requireRole(['SUPER_ADMIN', 'CLINIC_ADMIN']), updateStaff);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'CLINIC_ADMIN']), deleteStaff);

// Attendance
router.get('/attendance', getAttendance);
router.post('/attendance', markAttendance);

// Leaves
router.get('/leaves', getLeaves);
router.post('/leaves', applyLeave);
router.put('/leaves/:id', updateLeaveStatus);

// Schedules
router.get('/schedule', getSchedules);
router.post('/schedule', updateSchedule);

export default router;
