'use client';

import { query } from '@/app/config/db';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await query(`
          SELECT user_id, user_name, COUNT(*) as plant_count
          FROM plants
          GROUP BY user_id, user_name
          ORDER BY plant_count DESC
          LIMIT 50
        `);
        setLeaderboard(res.rows);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          Top contributors tracking the most plants
        </p>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableCaption>Top 50 plant trackers</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Plants Tracked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : leaderboard.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              leaderboard.map((user, index) => (
                <TableRow key={user.user_id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user.user_name}`} />
                        <AvatarFallback>{user.user_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{user.user_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{user.plant_count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}