'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/app/components/ui/skeleton';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface LeaderboardUser {
  user_id: string;
  user_name: string;
  plant_count: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const data = await response.json();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500 font-bold';
    return '';
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-2xl sm:text-3xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground">
          Top contributors tracking the most plants
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
        {leaderboard.slice(0, 3).map((user, index) => (
          <Card key={user.user_id} className="text-center">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-center mb-3">
                {getRankIcon(index + 1)}
              </div>
              <Avatar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user.user_name}`} />
                <AvatarFallback className="text-lg">{user.user_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-sm sm:text-base mb-1 truncate">{user.user_name}</h3>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{user.plant_count}</p>
              <p className="text-xs text-muted-foreground">plants</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Plant Trackers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Plants Tracked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-12 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : leaderboard.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <div className="text-center">
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold mb-2">No data available</h3>
                        <p className="text-sm text-muted-foreground">
                          Start tracking plants to appear on the leaderboard!
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leaderboard.map((user, index) => (
                    <TableRow key={user.user_id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRankIcon(index + 1)}
                          <span className={`font-medium ${getRankColor(index + 1)}`}>
                            {index + 1}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${user.user_name}`} />
                            <AvatarFallback className="text-sm">{user.user_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{user.user_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {index + 1 === 1 ? '🥇 Gold' : index + 1 === 2 ? '🥈 Silver' : index + 1 === 3 ? '🥉 Bronze' : `Rank #${index + 1}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-lg">{user.plant_count}</span>
                          <span className="text-sm text-muted-foreground">plants</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      {!loading && leaderboard.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Want to climb the leaderboard? Start tracking more plants!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/dashboard" className="inline-flex">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Track a Plant
              </button>
            </a>
            <a href="/map" className="inline-flex">
              <button className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-lg font-medium transition-colors">
                View Map
              </button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}