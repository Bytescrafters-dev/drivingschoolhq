"use client";

import { ChevronDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCalendarDate, formatDateTime } from "@/lib/dates";
import type { Licence } from "@/types/licence";

/** Every licence recorded, newest first (current included). */
export const LicenceHistoryCard = ({
  history,
  currentId,
}: {
  history: Licence[];
  currentId: string | undefined;
}) => {
  if (history.length === 0) return null;

  const count = `${history.length} ${history.length === 1 ? "licence" : "licences"} recorded.`;

  return (
    // Collapsed while there's only the current licence (already shown above).
    <Collapsible defaultOpen={history.length > 1} asChild>
      <Card>
        <CardHeader>
          <CardTitle>Licence history</CardTitle>
          <CardDescription>{count}</CardDescription>
          <CardAction>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="group">
                <span className="group-data-[state=open]:hidden">Show</span>
                <span className="hidden group-data-[state=open]:inline">Hide</span>
                <ChevronDownIcon className="transition-transform group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
          </CardAction>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>Licence number</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Recorded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((licence, index) => {
                    const older = history[index + 1];
                    const gradeChanged = older && older.grade !== licence.grade;
                    return (
                      <TableRow key={licence.id}>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{licence.licenceNumber}</span>
                            {licence.id === currentId && <Badge>Current</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {gradeChanged ? (
                            <span>
                              <span className="text-muted-foreground">
                                {older.grade} →{" "}
                              </span>
                              <span className="font-medium">{licence.grade}</span>
                              <span className="sr-only">
                                {" "}
                                (changed from Grade {older.grade})
                              </span>
                            </span>
                          ) : (
                            licence.grade
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatCalendarDate(licence.issuedOn)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatCalendarDate(licence.expiresOn)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDateTime(licence.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
