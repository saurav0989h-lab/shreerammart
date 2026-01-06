import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gift, Star, Trophy, Sparkles, ShoppingBag, Percent } from 'lucide-react';

const POINTS_PER_100_RS = 1;
const TIERS = [
  { name: 'Bronze', minPoints: 0, color: 'bg-amber-600', perks: ['1 point per Rs. 100'] },
  { name: 'Silver', minPoints: 500, color: 'bg-gray-400', perks: ['1.5x points', 'Free delivery on orders above Rs. 300'] },
  { name: 'Gold', minPoints: 1500, color: 'bg-yellow-500', perks: ['2x points', 'Free delivery', '5% discount on all orders'] },
  { name: 'Platinum', minPoints: 5000, color: 'bg-purple-600', perks: ['3x points', 'Free delivery', '10% discount', 'Priority support'] }
];

export default function LoyaltyPoints({ user, orders }) {
  // Calculate points from completed orders
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalSpent = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const earnedPoints = Math.floor(totalSpent / 100) * POINTS_PER_100_RS;
  const redeemedPoints = user?.redeemed_points || 0;
  const availablePoints = earnedPoints - redeemedPoints;

  // Determine current tier
  const currentTier = [...TIERS].reverse().find(t => earnedPoints >= t.minPoints) || TIERS[0];
  const nextTier = TIERS.find(t => t.minPoints > earnedPoints);
  const progressToNext = nextTier 
    ? ((earnedPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  // Recent points activity
  const recentActivity = completedOrders.slice(0, 5).map(order => ({
    type: 'earned',
    points: Math.floor((order.total_amount || 0) / 100),
    description: `Order ${order.order_number}`,
    date: order.created_date
  }));

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-emerald-100 text-sm">Available Points</p>
              <p className="text-4xl font-bold">{availablePoints.toLocaleString()}</p>
            </div>
            <div className={`w-16 h-16 rounded-full ${currentTier.color} flex items-center justify-center`}>
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${currentTier.color} text-white`}>{currentTier.name}</Badge>
            {nextTier && (
              <span className="text-emerald-100 text-sm">
                {nextTier.minPoints - earnedPoints} points to {nextTier.name}
              </span>
            )}
          </div>

          {nextTier && (
            <Progress value={progressToNext} className="h-2 bg-emerald-600" />
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tier Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> Your Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentTier.perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">{perk}</span>
                </div>
              ))}
            </div>

            {nextTier && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Unlock at {nextTier.name}:</p>
                <div className="space-y-2">
                  {nextTier.perks.filter(p => !currentTier.perks.includes(p)).map((perk, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How to Earn */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" /> How to Earn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium">Shop & Earn</p>
                <p className="text-sm text-gray-500">Earn 1 point for every Rs. 100 spent</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Percent className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Redeem Points</p>
                <p className="text-sm text-gray-500">100 points = Rs. 10 discount</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">Total Earned (Lifetime)</p>
              <p className="text-2xl font-bold text-emerald-600">{earnedPoints.toLocaleString()} pts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Points Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Gift className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No points activity yet</p>
              <p className="text-sm">Start shopping to earn points!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'earned' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {activity.type === 'earned' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${activity.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                    {activity.type === 'earned' ? '+' : '-'}{activity.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}