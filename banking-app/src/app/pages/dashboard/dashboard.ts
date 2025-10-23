import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule, MatSnackBarModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  userId!: number;
  fullName = '';
  accounts: any[] = [];
  transactions: any[] = [];
  selectedAccountId: number | null = null;

  // Transaction dialog state
  showTransactionDialog = false;

  // Fraud alert banner
  fraudAlert: string | null = null;

  // New transaction form model
  newTransaction = {
    amount: 0,
    type: 'Credit',
    description: '',
    duration: 0,
    loginAttempts: 0,
    channel: 'Web'
  };

  // Chart data
  chartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Credits', 'Debits'],
    datasets: [
      { data: [0, 0], backgroundColor: ['#4caf50', '#f44336'] }
    ]
  };

  chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('userId');
    this.userId = param ? +param : 0;
    this.fullName = history.state['fullName'] || '';

    console.log('Dashboard loaded with userId:', this.userId, 'fullName:', this.fullName);

    if (this.userId > 0) {
      this.dashboardService.getAccounts(this.userId).subscribe({
        next: (res) => {
          this.accounts = res;
          if (this.accounts.length > 0) {
            this.loadTransactions(this.accounts[0].accountId);
          }
        },
        error: (err) => {
          console.error('Error fetching accounts:', err);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadTransactions(accountId: number) {
    this.selectedAccountId = accountId;
    this.dashboardService.getTransactions(accountId).subscribe({
      next: (res) => {
        this.transactions = res;

        if (!this.transactions || this.transactions.length === 0) {
          this.chartData = {
            labels: ['Credits', 'Debits'],
            datasets: [{ data: [0, 0], backgroundColor: ['#4caf50', '#f44336'] }]
          };
          return;
        }

        const credits = this.transactions
          .filter((t: any) => t.type?.toLowerCase() === 'credit')
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        const debits = this.transactions
          .filter((t: any) => t.type?.toLowerCase() === 'debit')
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        this.chartData = {
          labels: ['Credits', 'Debits'],
          datasets: [
            { data: [credits, debits], backgroundColor: ['#4caf50', '#f44336'] }
          ]
        };
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
      }
    });
  }

  

  logout() {
    this.router.navigate(['/login']);
  }

  // Dialog controls
  openTransactionDialog() {
    this.showTransactionDialog = true;
  }

  closeTransactionDialog() {
    this.showTransactionDialog = false;
  }

  // Create transaction
  submitTransaction() {
    if (!this.selectedAccountId) {
      this.snackBar.open('⚠️ Please select an account first', 'Close', {
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'center',
        duration: 4000
      });
      return;
    }

    const payload = {
      accountId: this.selectedAccountId,
      amount: this.newTransaction.amount,
      type: this.newTransaction.type,
      description: this.newTransaction.description,
      duration: this.newTransaction.duration,
      loginAttempts: this.newTransaction.loginAttempts,
      channel: this.newTransaction.channel
    };

    this.dashboardService.createTransaction(payload).subscribe({
      next: () => {
        this.snackBar.open('✅ Transaction successful', 'Close', {
          panelClass: ['success-snackbar'],
          verticalPosition: 'top',
          horizontalPosition: 'center',
          duration: 4000
        });

        this.fraudAlert = null; // clear fraud alert

        this.closeTransactionDialog();
        this.dashboardService.getAccounts(this.userId).subscribe(accts => this.accounts = accts);
        this.loadTransactions(this.selectedAccountId!);
        

        // reset form
        this.newTransaction = {
          amount: 0,
          type: 'Credit',
          description: '',
          duration: 0,
          loginAttempts: 0,
          channel: 'Web'
        };
      },
      error: (err) => {
        let message = err.error?.message || 'Transaction failed';
        if (err.error?.reason) {
          message += ` → ${err.error.reason}`;
        }

        this.fraudAlert = message; // show fraud banner

        this.snackBar.open(`🚨 ${message}`, 'Close', {
          panelClass: ['error-snackbar'],
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }
}
