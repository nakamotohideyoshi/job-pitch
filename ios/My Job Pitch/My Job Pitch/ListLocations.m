//
//  ListLocations.m
//  My Job Pitch
//
//  Created by user on 10/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ListLocations.h"
#import "SimpleListCell.h"
#import "ListJobs.h"
#import "CreateRecruiterProfile.h"

@interface ListLocations () {
    NSMutableArray *data;
    NSInteger editRow;
}

@property (weak, nonatomic) IBOutlet UITableView *locations;
@property (weak, nonatomic) IBOutlet UIView *emptyView;

@end

@implementation ListLocations

- (void)viewDidLoad {
    [super viewDidLoad];
    self.locations.allowsMultipleSelectionDuringEditing = NO;
    editRow = -1;
}

-(void)viewWillAppear:(BOOL)animated {
    [self.emptyView setHidden:true];
    [SVProgressHUD show];
    [self.appDelegate.api loadLocationsForBusiness:self.business.id success:^(NSArray *locations) {
        if (locations.count) {
            data = (NSMutableArray*)locations;
            [self.locations setHidden:false];
            [self.locations reloadData];
        } else {
            [self.locations setHidden:true];
            [self.emptyView setHidden:false];
        }
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

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    SimpleListCell *cell = [self.locations dequeueReusableCellWithIdentifier:@"SimpleListCell"];
    Location *location = [self->data objectAtIndex:indexPath.row];
    cell.title.text = location.name;
    Image *image = [location getImage];
    if (image) {
        [self loadImageURL:image.thumbnail
                      into:cell.image
             withIndicator:cell.imageActivity];
    } else {
        cell.image.image = nil;
        cell.imageActivity.hidden = true;
    }
    cell.subtitle.text = [NSString stringWithFormat:@"Includes %u %@", location.jobs.count, (location.jobs.count == 1?@"job":@"jobs")];
    cell.backgroundColor = [UIColor clearColor];
    cell.selectedBackgroundView = [[UIView alloc] init];
    cell.selectedBackgroundView.backgroundColor = [UIColor colorWithWhite:1.0 alpha:0.5];

    return cell;
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath {
    // Return YES if you want the specified item to be editable.
    return YES;
}

- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath {
    
    if (editingStyle == UITableViewCellEditingStyleDelete) {
        
        Location *location = [self->data objectAtIndex:editRow];
        NSString *msg = [NSString stringWithFormat:@"Are you sure you want to delete %@", location.name];
        [MyAlertController title:@"Confirm" message:msg ok:@"Delete" okCallback:^{
            [SVProgressHUD show];
            [self.appDelegate.api deleteLocation:location
                                         success:^(void) {
                                             [SVProgressHUD dismiss];
                                             [self->data removeObject:location];
                                             [self.locations reloadData];
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

- (IBAction)addWorkPlace:(id)sender {
    CreateRecruiterProfile *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"CreateRecruiterProfile"];
    controller.hiddenBusiness = YES;
    controller.business = _business;
    if (editRow != -1) {
        controller.location = [self->data objectAtIndex:editRow];
    }
    [self.navigationController pushViewController:controller animated:YES];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([[segue identifier] isEqualToString:@"goto_job_list"]) {
        ListJobs *controller = [segue destinationViewController];
        NSInteger index = self.locations.indexPathForSelectedRow.row;
        controller.location = [self->data objectAtIndex:index];
    }
}

@end
