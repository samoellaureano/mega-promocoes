'use client';

import React, { useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  Users,
  ShoppingBag,
  TrendingUp,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  LogOut,
  Search,
  Filter,
  MoreVertical,
  RefreshCw,
  Flame,
  Star,
  Target
} from 'lucide-react';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/AdminLayout';
import { StatCard } from '@/components/StatCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Buscar dados do dashboard
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard');
      return response.data;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  if (!user) {
    router.push('/admin/login');
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Activity className="h-8 w-8 text-primary-600 mr-3" />
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Visão geral da plataforma de promoções
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="btn btn-secondary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </button>
            <button className="btn btn-primary">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </button>
          </div>
        </div>

        {/* Loading State */}\n        {isLoading ? (\n          <div className=\"flex justify-center py-12\">\n            <LoadingSpinner size=\"lg\" text=\"Carregando dashboard...\" />\n          </div>\n        ) : (\n          <>\n            {/* Stats Cards */}\n            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">\n              <StatCard\n                title=\"Total de Promoções\"\n                value={dashboardData?.overview?.totalPromotions || 0}\n                icon={ShoppingBag}\n                trend={{ value: dashboardData?.weeklyStats?.newPromotions || 0, label: 'esta semana' }}\n                color=\"blue\"\n              />\n              \n              <StatCard\n                title=\"Aprovadas\"\n                value={dashboardData?.overview?.approvedPromotions || 0}\n                icon={CheckCircle}\n                trend={{ value: Math.round(((dashboardData?.overview?.approvedPromotions || 0) / (dashboardData?.overview?.totalPromotions || 1)) * 100), label: '% aprovação', isPercentage: true }}\n                color=\"green\"\n              />\n              \n              <StatCard\n                title=\"Pendentes\"\n                value={dashboardData?.overview?.pendingPromotions || 0}\n                icon={Clock}\n                color=\"yellow\"\n              />\n              \n              <StatCard\n                title=\"Mensagens Enviadas\"\n                value={dashboardData?.overview?.sentMessagesCount || 0}\n                icon={MessageCircle}\n                trend={{ value: dashboardData?.weeklyStats?.sentMessages || 0, label: 'esta semana' }}\n                color=\"purple\"\n              />\n            </div>\n\n            {/* Charts Section */}\n            <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">\n              {/* Top Categories Chart */}\n              <div className=\"card p-6\">\n                <div className=\"flex items-center justify-between mb-4\">\n                  <h3 className=\"text-lg font-semibold text-gray-900\">Top Categorias</h3>\n                  <Target className=\"h-5 w-5 text-gray-400\" />\n                </div>\n                \n                <div className=\"h-64\">\n                  <ResponsiveContainer width=\"100%\" height=\"100%\">\n                    <BarChart data={dashboardData?.topCategories || []}>\n                      <CartesianGrid strokeDasharray=\"3 3\" />\n                      <XAxis \n                        dataKey=\"category\" \n                        tick={{ fontSize: 12 }}\n                        angle={-45}\n                        textAnchor=\"end\"\n                        height={60}\n                      />\n                      <YAxis />\n                      <Tooltip />\n                      <Bar \n                        dataKey=\"_count.id\" \n                        fill=\"#3B82F6\" \n                        radius={[4, 4, 0, 0]}\n                        name=\"Promoções\"\n                      />\n                    </BarChart>\n                  </ResponsiveContainer>\n                </div>\n              </div>\n\n              {/* Delivery Stats */}\n              <div className=\"card p-6\">\n                <div className=\"flex items-center justify-between mb-4\">\n                  <h3 className=\"text-lg font-semibold text-gray-900\">Status de Entrega</h3>\n                  <MessageCircle className=\"h-5 w-5 text-gray-400\" />\n                </div>\n                \n                <div className=\"h-64\">\n                  <ResponsiveContainer width=\"100%\" height=\"100%\">\n                    <PieChart>\n                      <Pie\n                        data={[\n                          { name: 'Entregues', value: dashboardData?.weeklyStats?.delivered || 0 },\n                          { name: 'Falharam', value: dashboardData?.weeklyStats?.failed || 0 },\n                          { name: 'Clicadas', value: dashboardData?.weeklyStats?.clicked || 0 }\n                        ]}\n                        cx=\"50%\"\n                        cy=\"50%\"\n                        outerRadius={80}\n                        dataKey=\"value\"\n                        label\n                      >\n                        {COLORS.map((color, index) => (\n                          <Cell key={`cell-${index}`} fill={color} />\n                        ))}\n                      </Pie>\n                      <Tooltip />\n                    </PieChart>\n                  </ResponsiveContainer>\n                </div>\n                \n                {dashboardData?.weeklyStats?.clickRate > 0 && (\n                  <div className=\"mt-4 text-center\">\n                    <p className=\"text-sm text-gray-600\">\n                      Taxa de clique: <span className=\"font-semibold text-primary-600\">\n                        {dashboardData.weeklyStats.clickRate.toFixed(1)}%\n                      </span>\n                    </p>\n                  </div>\n                )}\n              </div>\n            </div>\n\n            {/* Recent Activity */}\n            <div className=\"card p-6\">\n              <div className=\"flex items-center justify-between mb-6\">\n                <h3 className=\"text-lg font-semibold text-gray-900 flex items-center\">\n                  <Flame className=\"h-5 w-5 text-orange-500 mr-2\" />\n                  Top Descontos da Semana\n                </h3>\n                <button className=\"text-primary-600 hover:text-primary-700 text-sm font-medium\">\n                  Ver todas\n                </button>\n              </div>\n              \n              <div className=\"space-y-3\">\n                {dashboardData?.topDiscounts?.slice(0, 5).map((promo: any, index: number) => (\n                  <div key={promo.id} className=\"flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors\">\n                    <div className=\"flex items-center space-x-3\">\n                      <div className=\"flex-shrink-0\">\n                        <div className=\"w-8 h-8 bg-fire-gradient rounded-full flex items-center justify-center text-white text-sm font-bold\">\n                          #{index + 1}\n                        </div>\n                      </div>\n                      \n                      <div className=\"min-w-0 flex-1\">\n                        <p className=\"text-sm font-medium text-gray-900 truncate\">\n                          {promo.title}\n                        </p>\n                        <p className=\"text-sm text-gray-500\">\n                          {promo.store}\n                        </p>\n                      </div>\n                    </div>\n                    \n                    <div className=\"flex items-center space-x-3\">\n                      <div className=\"text-right\">\n                        <p className=\"text-lg font-bold text-success-600\">\n                          {promo.discountPercent.toFixed(0)}% OFF\n                        </p>\n                        <p className=\"text-xs text-gray-500\">\n                          {new Date(promo.createdAt).toLocaleDateString('pt-BR')}\n                        </p>\n                      </div>\n                      \n                      <Star className=\"h-4 w-4 text-yellow-400\" />\n                    </div>\n                  </div>\n                ))}\n              </div>\n            </div>\n\n            {/* Quick Actions */}\n            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">\n              <button \n                onClick={() => router.push('/admin/promotions')}\n                className=\"card p-6 hover:shadow-lg transition-all duration-200 group\"\n              >\n                <div className=\"flex items-center justify-between mb-4\">\n                  <ShoppingBag className=\"h-8 w-8 text-primary-600\" />\n                  <div className=\"text-2xl font-bold text-gray-900\">\n                    {dashboardData?.overview?.pendingPromotions || 0}\n                  </div>\n                </div>\n                <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">Gerenciar Promoções</h3>\n                <p className=\"text-gray-600 text-sm\">Aprovar e gerenciar promoções pendentes</p>\n              </button>\n              \n              <button \n                onClick={() => router.push('/admin/whatsapp')}\n                className=\"card p-6 hover:shadow-lg transition-all duration-200 group\"\n              >\n                <div className=\"flex items-center justify-between mb-4\">\n                  <MessageCircle className=\"h-8 w-8 text-success-600\" />\n                  <div className=\"text-2xl font-bold text-gray-900\">\n                    {dashboardData?.overview?.activeTargets || 0}\n                  </div>\n                </div>\n                <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">WhatsApp</h3>\n                <p className=\"text-gray-600 text-sm\">Configurar e monitorar envios</p>\n              </button>\n              \n              <button \n                onClick={() => router.push('/admin/scraping')}\n                className=\"card p-6 hover:shadow-lg transition-all duration-200 group\"\n              >\n                <div className=\"flex items-center justify-between mb-4\">\n                  <Target className=\"h-8 w-8 text-purple-600\" />\n                  <div className=\"text-2xl font-bold text-gray-900\">\n                    {dashboardData?.overview?.activeTargets || 0}\n                  </div>\n                </div>\n                <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">Scraping</h3>\n                <p className=\"text-gray-600 text-sm\">Gerenciar fontes de dados</p>\n              </button>\n            </div>\n          </>\n        )}\n      </div>\n    </AdminLayout>\n  );\n}