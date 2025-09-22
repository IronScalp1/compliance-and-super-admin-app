import type { Carer, CarerDocument, ComplianceStats } from '@/types';

export class ComplianceEngine {
  private static readonly THRESHOLDS = {
    GREEN: 60, // days
    AMBER: 60, // days - anything less than 60 days is "Due to Expire"
    RED: 0     // expired or missing
  };

  static calculateCarerStatus(carer: Carer, documents: CarerDocument[]): 'green' | 'amber' | 'red' {
    if (!documents.length) return 'red';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const statuses = documents.map(doc => {
      const expiryDate = new Date(doc.expires_on);
      expiryDate.setHours(0, 0, 0, 0);
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= this.THRESHOLDS.RED || doc.status === 'expired') return 'red';
      if (daysUntilExpiry <= this.THRESHOLDS.AMBER) return 'amber';
      return 'green';
    });

    // Return worst status (red > amber > green)
    if (statuses.includes('red')) return 'red';
    if (statuses.includes('amber')) return 'amber';
    return 'green';
  }

  static calculateAgencyStats(carers: Carer[]): ComplianceStats {
    const stats = {
      green_count: 0,
      amber_count: 0,
      red_count: 0,
      total_carers: carers.length,
      expiring_soon: 0,
      overdue: 0,
      overall_score: 0
    };

    carers.forEach(carer => {
      switch (carer.status) {
        case 'green':
          stats.green_count++;
          break;
        case 'amber':
          stats.amber_count++;
          stats.expiring_soon++;
          break;
        case 'red':
          stats.red_count++;
          stats.overdue++;
          break;
      }
    });

    // Calculate overall score (0-100)
    if (stats.total_carers === 0) {
      stats.overall_score = 0;
    } else {
      stats.overall_score = Math.round(
        (stats.green_count * 100 + stats.amber_count * 50) / stats.total_carers
      );
    }

    return stats;
  }

  static getStatusColor(status: 'green' | 'amber' | 'red'): string {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'amber': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
    }
  }

  static getStatusIcon(status: 'green' | 'amber' | 'red'): string {
    switch (status) {
      case 'green': return '✓';
      case 'amber': return '⚠';
      case 'red': return '✕';
    }
  }

  static getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  static getExpiringDocuments(documents: CarerDocument[], days: number = 60): CarerDocument[] {
    const today = new Date();
    const threshold = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));

    return documents.filter(doc => {
      const expiryDate = new Date(doc.expires_on);
      return expiryDate <= threshold && expiryDate >= today;
    });
  }

  static getExpiredDocuments(documents: CarerDocument[]): CarerDocument[] {
    const today = new Date();
    
    return documents.filter(doc => {
      const expiryDate = new Date(doc.expires_on);
      return expiryDate < today || doc.status === 'expired';
    });
  }
}