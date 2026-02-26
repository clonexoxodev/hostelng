import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Hostel {
  id: string;
  name: string;
  location: string;
  university: string;
  price: number;
  images: string[];
  rooms_available: number;
  owner_id: string;
  created_at: string;
}

interface HostelListProps {
  userId: string;
  isSuperAdmin: boolean;
}

const HostelList: React.FC<HostelListProps> = ({ userId, isSuperAdmin }) => {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadHostels();
  }, [userId, isSuperAdmin]);

  const loadHostels = async () => {
    try {
      let query = supabase.from('hostels').select('*');
      
      // Super admin sees all hostels, regular users see only their own
      if (!isSuperAdmin) {
        query = query.eq('owner_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setHostels(data || []);
    } catch (error: any) {
      toast.error('Failed to load hostels: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('hostels')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast.success('Hostel deleted successfully');
      setHostels(hostels.filter(h => h.id !== deleteId));
      setDeleteId(null);
    } catch (error: any) {
      toast.error('Failed to delete hostel: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hostels.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <p className="text-muted-foreground mb-4">No hostels found</p>
        <Button onClick={() => navigate('/dashboard/hostel/new')}>
          Add Your First Hostel
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold text-sm">Hostel</th>
                <th className="text-left p-4 font-semibold text-sm">Location</th>
                <th className="text-left p-4 font-semibold text-sm">Price</th>
                <th className="text-left p-4 font-semibold text-sm">Rooms</th>
                <th className="text-right p-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hostels.map((hostel) => (
                <tr key={hostel.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {hostel.images?.[0] && (
                        <img
                          src={hostel.images[0]}
                          alt={hostel.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-foreground">{hostel.name}</p>
                        <p className="text-sm text-muted-foreground">{hostel.university}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {hostel.location}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      <span>₦</span>
                      {hostel.price?.toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {hostel.rooms_available} available
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/hostels/${hostel.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/dashboard/hostel/edit/${hostel.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteId(hostel.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hostel
              and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HostelList;
