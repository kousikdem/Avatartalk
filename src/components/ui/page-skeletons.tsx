import React, { memo } from 'react';
import { Skeleton } from './skeleton';

// Dashboard Main Skeleton - Shows design instantly with skeleton data placeholders
export const DashboardSkeleton = memo(() => (
  <div className="w-full max-w-7xl mx-auto bg-white p-3 sm:p-6">
    {/* Header Section */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex-1 min-w-0">
          <Skeleton className="h-7 sm:h-9 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-3 sm:p-6">
          <div className="flex items-center justify-between pb-2">
            <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
            <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
          </div>
          <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mt-2" />
          <Skeleton className="h-3 w-24 mt-2 hidden sm:block" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2">
        {/* Quick Actions Skeleton */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-lg">
          <div className="p-3 sm:p-6 pb-2 sm:pb-4">
            <Skeleton className="h-5 sm:h-6 w-32" />
          </div>
          <div className="p-3 sm:p-6 pt-0">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="h-14 sm:h-20 bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 sm:gap-2">
                  <Skeleton className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg" />
                  <Skeleton className="h-2 sm:h-3 w-8 sm:w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Skeleton */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
        <div className="bg-slate-100 rounded-lg h-48 flex items-center justify-center">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <Skeleton className="h-5 w-28" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
));

DashboardSkeleton.displayName = 'DashboardSkeleton';

// Settings Page Skeleton
export const SettingsSkeleton = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6">
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-10 w-24 flex-shrink-0" />
        ))}
      </div>

      {/* Content Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-40" />
        </div>
        
        {/* Profile Picture */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>

        <Skeleton className="h-10 w-32 mt-4" />
      </div>
    </div>
  </div>
));

SettingsSkeleton.displayName = 'SettingsSkeleton';

// Feed Page Skeleton
export const FeedSkeleton = memo(() => (
  <div className="min-h-screen bg-background p-4 sm:p-6">
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Skeleton className="h-8 w-36 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 bg-muted rounded-lg">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 flex-1" />
            ))}
          </div>

          {/* Post Cards */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border-border border rounded-lg p-4">
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <div className="bg-card border-border border rounded-lg p-4">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

FeedSkeleton.displayName = 'FeedSkeleton';

// Analytics Page Skeleton
export const AnalyticsSkeleton = memo(() => (
  <div className="container mx-auto p-6 space-y-8 bg-background min-h-screen">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card border-border border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>

    {/* Tabs */}
    <div className="flex gap-1 p-1.5 bg-muted/50 rounded-xl flex-wrap">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Skeleton key={i} className="h-9 w-24" />
      ))}
    </div>

    {/* Chart */}
    <div className="bg-card border-border border rounded-lg p-6">
      <Skeleton className="h-6 w-40 mb-2" />
      <Skeleton className="h-4 w-64 mb-4" />
      <Skeleton className="h-80 w-full" />
    </div>
  </div>
));

AnalyticsSkeleton.displayName = 'AnalyticsSkeleton';

// Products Page Skeleton
export const ProductsSkeleton = memo(() => (
  <div className="min-h-screen bg-background p-4 sm:p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="border-2 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-28 mt-1" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>

      {/* Alert */}
      <Skeleton className="h-14 w-full rounded-lg" />

      {/* Tabs & Content */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-40 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

ProductsSkeleton.displayName = 'ProductsSkeleton';

// Followers Page Skeleton
export const FollowersSkeleton = memo(() => (
  <div className="min-h-screen bg-background p-4 sm:p-6">
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border rounded-lg p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-muted rounded-lg">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 flex-1" />
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border rounded-lg p-4 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        ))}
      </div>
    </div>
  </div>
));

FollowersSkeleton.displayName = 'FollowersSkeleton';

// Avatar Builder Skeleton
export const AvatarBuilderSkeleton = memo(() => (
  <div className="min-h-screen bg-background">
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r p-4 space-y-4">
        <Skeleton className="h-8 w-40 mb-4" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Skeleton className="h-96 w-96 rounded-full" />
        </div>
      </div>
    </div>
  </div>
));

AvatarBuilderSkeleton.displayName = 'AvatarBuilderSkeleton';

// Generic Page Skeleton
export const GenericPageSkeleton = memo(({ 
  title = true,
  stats = 0,
  tabs = 0,
  cards = 6 
}: { 
  title?: boolean;
  stats?: number;
  tabs?: number;
  cards?: number;
}) => (
  <div className="min-h-screen bg-background p-4 sm:p-6">
    <div className="max-w-6xl mx-auto space-y-6">
      {title && (
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      )}

      {stats > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: stats }).map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
      )}

      {tabs > 0 && (
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {Array.from({ length: tabs }).map((_, i) => (
            <Skeleton key={i} className="h-9 flex-1" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
));

GenericPageSkeleton.displayName = 'GenericPageSkeleton';
