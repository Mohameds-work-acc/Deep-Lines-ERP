// dashboard.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin, interval } from 'rxjs';
import { takeUntil, startWith, switchMap, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { BlogService } from '../../services/blog.service';
import { EmployeeService } from '../../services/employee.service';
import { ProductService } from '../../services/product.service';
import { ProjectService } from '../../services/project.service';
import { SectorService } from '../../services/sector.service';

import { Blog } from '../../models/blog.model';
import { Employee } from '../../models/employee.model';
import { Product } from '../../models/product.model';
import { Project } from '../../models/project.model';
import { Sector } from '../../models/sector.model';

import { BaseChartDirective   } from 'ng2-charts';
import { CommonModule } from '@angular/common';
interface DashboardStats {
  totalBlogs: number;
  totalEmployees: number;
  totalProducts: number;
  totalProjects: number;
  totalSectors: number;
  recentBlogs: Blog[];
  recentEmployees: Employee[];
  recentProducts: Product[];
  recentProjects: Project[];
  recentSectors: Sector[];
  blogsWithImages: number;
  productsWithImages: number;
  projectsWithImages: number;
  sectorsWithImages: number;
  topSectors: { name: string; count: number }[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard-componant.html',
  styleUrls: ['./dashboard-componant.css'],
  imports: [CommonModule, BaseChartDirective]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  stats: DashboardStats = {
    totalBlogs: 0,
    totalEmployees: 0,
    totalProducts: 0,
    totalProjects: 0,
    totalSectors: 0,
    recentBlogs: [],
    recentEmployees: [],
    recentProducts: [],
    recentProjects: [],
    recentSectors: [],
    blogsWithImages: 0,
    productsWithImages: 0,
    projectsWithImages: 0,
    sectorsWithImages: 0,
    topSectors: []
  };

  loading = true;
  refreshing = false;
  lastUpdated = new Date();
  error: string | null = null;
  autoRefreshEnabled = true;
  tabs = ['overview', 'blogs', 'employees', 'products', 'projects', 'sectors'] as const;
  activeTab: typeof this.tabs[number] = 'overview';

  // Chart data
  distributionData: any;
  activityData: any;
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { usePointStyle: true, padding: 20 }
      }
    }
  };

  constructor(
    private blogService: BlogService,
    private employeeService: EmployeeService,
    private productService: ProductService,
    private projectService: ProjectService,
    private sectorService: SectorService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      blogs: this.blogService.getAll().pipe(catchError(err => [])),
      employees: this.employeeService.getAll().pipe(catchError(err => [])),
      products: this.productService.getAll().pipe(catchError(err => [])),
      projects: this.projectService.getAll().pipe(catchError(err => [])),
      sectors: this.sectorService.getAll().pipe(catchError(err => []))
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.processDashboardData(data);
          this.loading = false;
          this.refreshing = false;
          this.lastUpdated = new Date();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to load dashboard data. Please try again.';
          this.loading = false;
          this.refreshing = false;
          
          Swal.fire({
            title: 'Error',
            text: 'Failed to load dashboard data. Please refresh the page.',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
          this.cdr.detectChanges();
        }
      });
  }

  private processDashboardData(data: any): void {
    const blogs = data.blogs || [];
    const employees = data.employees || [];
    const products = data.products || [];
    const projects = data.projects || [];
    const sectors = data.sectors || [];

    // Calculate statistics
    this.stats = {
      totalBlogs: blogs.length,
      totalEmployees: employees.length,
      totalProducts: products.length,
      totalProjects: projects.length,
      totalSectors: sectors.length,
      recentBlogs: blogs.slice(0, 5),
      recentEmployees: employees.slice(0, 5),
      recentProducts: products.slice(0, 5),
      recentProjects: projects.slice(0, 5),
      recentSectors: sectors.slice(0, 5),
      blogsWithImages: blogs.filter((b: Blog) => b.imageUrl).length,
      productsWithImages: products.filter((p: Product) => p.imageUrl).length,
      projectsWithImages: projects.filter((p: Project) => p.imageUrl).length,
      sectorsWithImages: sectors.filter((s: Sector) => s.imageUrl).length,
      topSectors: this.calculateTopSectors(sectors, products, projects)
    };

    // Prepare chart data
    this.prepareChartData();
    this.cdr.detectChanges();
  }

  private calculateTopSectors(sectors: Sector[], products: Product[], projects: Project[]): { name: string; count: number }[] {
    const sectorMap = new Map<number, { name: string; count: number }>();
    
    sectors.forEach(sector => {
      sectorMap.set(sector.id, { name: sector.title, count: 0 });
    });

    // Count products per sector
    products.forEach(product => {
      if (product.sector?.id) {
        const sector = sectorMap.get(product.sector.id);
        if (sector) sector.count++;
      }
    });

    // Count projects per sector
    projects.forEach(project => {
      if (project.sectorId) {
        const sector = sectorMap.get(project.sectorId);
        if (sector) sector.count++;
      }
    });

    return Array.from(sectorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private prepareChartData(): void {
    // Distribution pie chart
    this.distributionData = {
      labels: ['Blogs', 'Employees', 'Products', 'Projects', 'Sectors'],
      datasets: [{
        data: [
          this.stats.totalBlogs,
          this.stats.totalEmployees,
          this.stats.totalProducts,
          this.stats.totalProjects,
          this.stats.totalSectors
        ],
        backgroundColor: [
          '#3b82f6', // blue
          '#10b981', // green
          '#8b5cf6', // purple
          '#f59e0b', // amber
          '#ef4444'  // red
        ],
        borderWidth: 0
      }]
    };

    // Activity trend (mock data - replace with actual trend data)
    this.activityData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Blogs',
          data: [65, 59, 80, 81, 56, 55, 40],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Products',
          data: [28, 48, 40, 19, 86, 27, 90],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  private setupAutoRefresh(): void {
    interval(300000) // Refresh every 5 minutes
      .pipe(
        takeUntil(this.destroy$),
        startWith(0),
        switchMap(() => {
          if (this.autoRefreshEnabled && !this.loading) {
            this.refreshing = true;
            return forkJoin({
              blogs: this.blogService.getAll().pipe(catchError(err => [])),
              employees: this.employeeService.getAll().pipe(catchError(err => [])),
              products: this.productService.getAll().pipe(catchError(err => [])),
              projects: this.projectService.getAll().pipe(catchError(err => [])),
              sectors: this.sectorService.getAll().pipe(catchError(err => []))
            });
          }
          return [];
        })
      )
      .subscribe(data => {
        if (data) {
          this.processDashboardData(data);
          this.refreshing = false;
          this.cdr.detectChanges();
        }
      });
  }

  refreshData(): void {
    this.refreshing = true;
    this.loadDashboardData();
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    
    Swal.fire({
      title: this.autoRefreshEnabled ? 'Auto-refresh Enabled' : 'Auto-refresh Disabled',
      text: this.autoRefreshEnabled ? 'Dashboard will update every 5 minutes' : 'Manual refresh only',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  viewDetails(type: string, id: number): void {
    this.router.navigate([`/${type}`, id]);
  }

  getImageUrl(item: any): string {
    return item.imageUrl || 'assets/placeholder.jpg';
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  }

  getCompletionRate(): number {
    const total = this.stats.totalBlogs + this.stats.totalEmployees + 
                  this.stats.totalProducts + this.stats.totalProjects + 
                  this.stats.totalSectors;
    const withImages = this.stats.blogsWithImages + this.stats.productsWithImages + 
                       this.stats.projectsWithImages + this.stats.sectorsWithImages;
    return total ? Math.round((withImages / total) * 100) : 0;
  }

  get averagePerSector(): number {
    const totalItems = this.stats.totalProducts + this.stats.totalProjects;
    return this.stats.totalSectors ? Math.round(totalItems / this.stats.totalSectors) : 0;
  }
}