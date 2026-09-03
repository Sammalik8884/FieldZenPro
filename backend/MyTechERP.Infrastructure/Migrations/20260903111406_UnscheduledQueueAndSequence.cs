using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyTechERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UnscheduledQueueAndSequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "ScheduledDate",
                table: "WorkOrders",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<int>(
                name: "SequenceOrder",
                table: "WorkOrders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_WorkOrders_CustomerId",
                table: "WorkOrders",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkOrders_SiteId",
                table: "WorkOrders",
                column: "SiteId");

            migrationBuilder.CreateIndex(
                name: "IX_JobEvidences_WorkOrderId",
                table: "JobEvidences",
                column: "WorkOrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_JobEvidences_WorkOrders_WorkOrderId",
                table: "JobEvidences",
                column: "WorkOrderId",
                principalTable: "WorkOrders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkOrders_Customers_CustomerId",
                table: "WorkOrders",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkOrders_Sites_SiteId",
                table: "WorkOrders",
                column: "SiteId",
                principalTable: "Sites",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobEvidences_WorkOrders_WorkOrderId",
                table: "JobEvidences");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkOrders_Customers_CustomerId",
                table: "WorkOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkOrders_Sites_SiteId",
                table: "WorkOrders");

            migrationBuilder.DropIndex(
                name: "IX_WorkOrders_CustomerId",
                table: "WorkOrders");

            migrationBuilder.DropIndex(
                name: "IX_WorkOrders_SiteId",
                table: "WorkOrders");

            migrationBuilder.DropIndex(
                name: "IX_JobEvidences_WorkOrderId",
                table: "JobEvidences");

            migrationBuilder.DropColumn(
                name: "SequenceOrder",
                table: "WorkOrders");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ScheduledDate",
                table: "WorkOrders",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);
        }
    }
}
