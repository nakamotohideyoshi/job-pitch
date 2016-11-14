//
//  ListJobs.m
//  My Job Pitch
//
//  Created by user on 10/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ListJobs.h"
#import "SimpleListCell.h"
#import "EditJob.h"
#import "ViewJobMenu.h"
#import "JobStatus.h"

@interface ListJobs () {
    NSMutableArray *data;
    NSInteger editRow;
    NSNumber *openStateID;
}

@property (weak, nonatomic) IBOutlet UITableView *jobs;
@property (weak, nonatomic) IBOutlet UIView *emptyView;
@property (weak, nonatomic) IBOutlet UILabel *tokensLabel;

@end

@implementation ListJobs

- (void)viewDidLoad {
    [super viewDidLoad];
    self.jobs.allowsMultipleSelectionDuringEditing = NO;
    editRow = -1;
    
    for (JobStatus *status in self.appDelegate.jobStatuses) {
        if ([status.name isEqualToString:JOB_STATUS_OPEN]) {
            openStateID = status.id;
            break;
        }
    }

}

-(void)viewWillAppear:(BOOL)animated
{
    [SVProgressHUD show];
    [self.appDelegate.api loadJobsForLocation:self.location.id success:^(NSArray *jobs) {
        if (jobs.count) {
            data = (NSMutableArray*)jobs;
            [self.jobs setHidden:false];
            [self.emptyView setHidden:true];
            [self.jobs reloadData];
        } else {
            [self.jobs setHidden:true];
            [self.emptyView setHidden:false];
        }
        self.tokensLabel.text = [NSString stringWithFormat:@"%d Credit", self.location.businessData.tokens.intValue];
        [SVProgressHUD dismiss];
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        [MyAlertController showError:@"Error loading data" callback:nil];
    }];
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 85;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return data ? data.count : 0;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    SimpleListCell *cell = [self.jobs dequeueReusableCellWithIdentifier:@"SimpleListCell"];
    Job *job = [self->data objectAtIndex:indexPath.row];
    cell.title.text = job.title;
    Image *image = [job getImage];
    if (image) {
        [self loadImageURL:image.thumbnail
                      into:cell.image
             withIndicator:cell.imageActivity];
    } else {
        cell.image.image = [UIImage imageNamed:@"default-logo"];
        cell.imageActivity.hidden = true;
    }
    
    cell.backgroundColor = [UIColor clearColor];
    cell.selectedBackgroundView = [[UIView alloc] init];
    cell.selectedBackgroundView.backgroundColor = [UIColor colorWithWhite:1.0 alpha:0.5];

    if (job.status == openStateID) {
        cell.image.alpha = 1;
        
        UIFont *currentFont = cell.title.font;
        UIFont *newFont = [UIFont fontWithName:[currentFont.fontName stringByReplacingOccurrencesOfString:@"Italic" withString:@"Bold"] size:currentFont.pointSize];
        cell.title.font = newFont;
        cell.title.alpha = 1;
        
        currentFont = cell.subtitle.font;
        newFont = [UIFont fontWithName:[currentFont.fontName stringByReplacingOccurrencesOfString:@"-Italic" withString:@""] size:currentFont.pointSize];
        cell.subtitle.font = newFont;
        cell.subtitle.alpha = 1;
        cell.subtitle.text = job.desc;
    } else {
        cell.image.alpha = 0.4f;
        
        UIFont *currentFont = cell.title.font;
        UIFont *newFont = [UIFont fontWithName:[currentFont.fontName stringByReplacingOccurrencesOfString:@"Bold" withString:@"Italic"] size:currentFont.pointSize];
        cell.title.font = newFont;
        cell.title.alpha = 0.4f;
        
        currentFont = cell.subtitle.font;
        newFont = [UIFont fontWithName:[NSString stringWithFormat:@"%@-Italic",currentFont.fontName] size:currentFont.pointSize];
        cell.subtitle.font = newFont;
        cell.subtitle.alpha = 0.4f;
        cell.subtitle.text = [NSString stringWithFormat:@"(Inactive) %@", job.desc];
    }
 
    return cell;
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath {
    // Return YES if you want the specified item to be editable.
    return YES;
}

- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath {
    if (editingStyle == UITableViewCellEditingStyleDelete) {
        
        Job *job = [self->data objectAtIndex:editRow];
        NSString *msg = [NSString stringWithFormat:@"Are you sure you want to delete %@", job.title];
        [MyAlertController title:nil message:msg ok:@"Delete" okCallback:^{
            [SVProgressHUD show];
            [self.appDelegate.api deleteJob:job
                                         success:^(void) {
                                             [SVProgressHUD dismiss];
                                             [self->data removeObject:job];
                                             [self.jobs reloadData];
                                         } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                             [MyAlertController showError:@"Error deleting data" callback:nil];
                                         }];
            
        } cancel:@"Cancel" cancelCallback:nil];
        
    }
}

- (void)tableView:(UITableView*)tableView willBeginEditingRowAtIndexPath:(NSIndexPath *)indexPath {
    self.navigationItem.rightBarButtonItem.title = @"Edit";
    editRow = indexPath.row;
}

- (void)tableView:(UITableView*)tableView didEndEditingRowAtIndexPath:(NSIndexPath *)indexPath {
    self.navigationItem.rightBarButtonItem.title = @"Add";
    editRow = -1;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    Job *job = [self->data objectAtIndex:indexPath.row];
    if (job.status == openStateID) {
        ViewJobMenu *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"ViewJobMenu"];
        NSInteger index = self.jobs.indexPathForSelectedRow.row;
        controller.job = [self->data objectAtIndex:index];
        [self.navigationController pushViewController:controller animated:YES];
    } else {
        [MyAlertController title:nil message:@"You can't view an inactive job!" ok:@"OK" okCallback:nil cancel:nil cancelCallback:nil];
    }
}

- (IBAction)addJob:(id)sender {
    EditJob *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"EditJob"];
    if (editRow != -1) {
        controller.job = [self->data objectAtIndex:editRow];
    } else {
        controller.location = _location;
    }
    [self.navigationController pushViewController:controller animated:YES];
}


@end
