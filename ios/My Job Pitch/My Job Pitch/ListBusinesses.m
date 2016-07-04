//
//  RecruiterHomeViewController.m
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "ListBusinesses.h"
#import "SimpleListCell.h"
#import "ListLocations.h"
#import "CreateRecruiterProfile.h"
#import "MyAlertController.h"

@interface ListBusinesses () {
    NSMutableArray *data;
    NSInteger editRow;
}

@property (weak, nonatomic) IBOutlet UITableView *businesses;

@end

@implementation ListBusinesses

- (void)viewDidLoad {
    [super viewDidLoad];
    self.businesses.allowsMultipleSelectionDuringEditing = NO;
    editRow = -1;
}

-(void)viewWillAppear:(BOOL)animated {
    [self showProgress:true];
    [self.appDelegate.api loadBusinesses:^(NSArray *businesses) {
        [self showProgress:false];
        data = (NSMutableArray*)businesses;
        [self.businesses reloadData];
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        [MyAlertController title:@"Error" message:@"Error loading data"
                              ok:@"Okay" okCallback:nil cancel:nil cancelCallback:nil];
    }];
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 85;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return data ? data.count : 0;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    SimpleListCell *cell = [self.businesses dequeueReusableCellWithIdentifier:@"SimpleListCell"];
    Business *business = [self->data objectAtIndex:indexPath.row];
    cell.title.text = business.name;
    Image *image = [business getImage];
    if (image) {
        [self loadImageURL:image.thumbnail
                      into:cell.image
             withIndicator:cell.imageActivity];
    } else {
        cell.image.image = nil;
        cell.imageActivity.hidden = true;
    }
    cell.subtitle.text = [NSString stringWithFormat:@"Includes %u %@", business.locations.count, (business.locations.count == 1?@"location":@"locations")];
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
    
        Business *business = [self->data objectAtIndex:editRow];
        NSString *msg = [NSString stringWithFormat:@"Are you sure you want to delete %@", business.name];
        [MyAlertController title:@"Confirm" message:msg ok:@"Delete" okCallback:^{
            [self showProgress:true];
            [self.appDelegate.api deleteBusiness:business
                                         success:^(void) {
                                             [self showProgress:false];
                                             [self->data removeObject:business];
                                             [self.businesses reloadData];
                                         } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                             [MyAlertController title:@"Error" message:@"Error deleting data"
                                                                   ok:@"Okay" okCallback:nil cancel:nil cancelCallback:nil];
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

- (IBAction)addBusiness:(id)sender {
    CreateRecruiterProfile *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"CreateRecruiterProfile"];
    controller.hiddenLocation = YES;
    if (editRow != -1) {
        controller.business = [self->data objectAtIndex:editRow];
    }
    [self.navigationController pushViewController:controller animated:YES];
}

- (IBAction)logout {
    [MyAlertController title:@"Logout" message:@"Are you sure you want to logout?" ok:@"Yes" okCallback:^{
        [self.navigationController popViewControllerAnimated:true];
    } cancel:@"No" cancelCallback:nil];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([[segue identifier] isEqualToString:@"goto_location_list"]) {
        ListLocations *controller = [segue destinationViewController];
        NSInteger index = self.businesses.indexPathForSelectedRow.row;
        controller.business = [self->data objectAtIndex:index];
    }
}

@end
